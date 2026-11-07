import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeSalaryStructure } from 'src/database/entity/employee-salary-structure.entity';
import {
  EmployeeSalary,
  SalaryStatus,
} from 'src/database/entity/employee-salary.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { In, Repository } from 'typeorm';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { LeaveService } from '../leave/leave.service';
import { MailerService } from '../mailer/mailer.service';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(EmployeeSalary)
    private readonly salaryRepository: Repository<EmployeeSalary>,
    @InjectRepository(EmployeeSalaryStructure)
    private readonly structureRepository: Repository<EmployeeSalaryStructure>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly leaveService: LeaveService,
    private readonly mailerService: MailerService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  private async generateSlipNumber(
    organizationId: string,
    year: number,
    month: number,
  ): Promise<string> {
    const ym = `${year}${String(month).padStart(2, '0')}`;
    const count = await this.salaryRepository.count({ where: { organizationId } });
    const seq = String(count + 1).padStart(4, '0');
    const candidate = `SAL-${ym}-${seq}`;
    const exists = await this.salaryRepository.findOne({
      where: { slipNumber: candidate },
    });
    if (exists) {
      return `SAL-${ym}-${seq}-${Math.floor(100 + Math.random() * 900)}`;
    }
    return candidate;
  }

  async getStructure(
    employeeId: string,
    organizationId: string,
  ): Promise<EmployeeSalaryStructure | null> {
    return this.structureRepository.findOne({
      where: { employeeId, organizationId },
      relations: ['employee', 'updatedBy'],
    });
  }

  async upsertStructure(
    employeeId: string,
    organizationId: string,
    userId: string,
    payload: Partial<EmployeeSalaryStructure>,
  ): Promise<EmployeeSalaryStructure> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, organizationId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found in this organization');
    }

    let structure = await this.structureRepository.findOne({
      where: { employeeId, organizationId },
    });

    const cleanData = {
      basicSalary: Number(payload.basicSalary) || 0,
      hra: Number(payload.hra) || 0,
      da: Number(payload.da) || 0,
      conveyanceAllowance: Number(payload.conveyanceAllowance) || 0,
      medicalAllowance: Number(payload.medicalAllowance) || 0,
      specialAllowance: Number(payload.specialAllowance) || 0,
      pfEmployee: Number(payload.pfEmployee) || 0,
      pfEmployer: Number(payload.pfEmployer) || 0,
      esi: Number(payload.esi) || 0,
      professionalTax: Number(payload.professionalTax) || 0,
      tds: Number(payload.tds) || 0,
      panNumber: payload.panNumber ?? structure?.panNumber,
      uanNumber: payload.uanNumber ?? structure?.uanNumber,
      pfNumber: payload.pfNumber ?? structure?.pfNumber,
      esiNumber: payload.esiNumber ?? structure?.esiNumber,
      bankName: payload.bankName ?? structure?.bankName,
      accountNumber: payload.accountNumber ?? structure?.accountNumber,
      ifscCode: payload.ifscCode ?? structure?.ifscCode,
      casualLeaveQuota:
        payload.casualLeaveQuota !== undefined
          ? payload.casualLeaveQuota
          : structure?.casualLeaveQuota,
      sickLeaveQuota:
        payload.sickLeaveQuota !== undefined
          ? payload.sickLeaveQuota
          : structure?.sickLeaveQuota,
      paidLeaveQuota:
        payload.paidLeaveQuota !== undefined
          ? payload.paidLeaveQuota
          : structure?.paidLeaveQuota,
      updatedById: userId,
    };

    if (structure) {
      Object.assign(structure, cleanData);
    } else {
      structure = this.structureRepository.create({
        employeeId,
        organizationId,
        ...cleanData,
      });
    }

    const saved = await this.structureRepository.save(structure);

    try {
      await this.activityLogService.log(
        organizationId,
        userId,
        'salary_structure_updated',
        `Updated salary structure for ${employee.name}`,
        {
          employeeId: employee.id,
          entityId: saved.id,
        },
      );
    } catch (e) {
      console.error('Failed to log salary structure update:', e);
    }

    return saved;
  }

  async calculatePreview(
    organizationId: string,
    employeeId: string,
    month: number,
    year: number,
    totalWorkingDays: number = 30,
  ) {
    const [employee, structure, leaveSummary] = await Promise.all([
      this.employeeRepository.findOne({
        where: { id: employeeId, organizationId },
        relations: ['branch'],
      }),
      this.structureRepository.findOne({
        where: { employeeId, organizationId },
      }),
      this.leaveService.getLeaveBalance(employeeId, organizationId, year, month),
    ]);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const workingDays = Number(totalWorkingDays) || 30;
    const paidLeaves = Number(leaveSummary?.monthlySummary?.paidLeaves) || 0;
    const unpaidLeaves = Number(leaveSummary?.monthlySummary?.unpaidLeaves) || 0;
    const payableDays = Math.max(0, workingDays - unpaidLeaves);
    const daysWorked = Math.max(0, payableDays - paidLeaves);

    const basicSalary = Number(structure?.basicSalary) || 0;
    const hra = Number(structure?.hra) || 0;
    const da = Number(structure?.da) || 0;
    const conveyanceAllowance = Number(structure?.conveyanceAllowance) || 0;
    const medicalAllowance = Number(structure?.medicalAllowance) || 0;
    const specialAllowance = Number(structure?.specialAllowance) || 0;

    const baseFixedGross =
      basicSalary +
      hra +
      da +
      conveyanceAllowance +
      medicalAllowance +
      specialAllowance;

    const lopDeduction =
      workingDays > 0 && unpaidLeaves > 0
        ? Math.round((baseFixedGross / workingDays) * unpaidLeaves * 100) / 100
        : 0;

    const pfDeduction = Number(structure?.pfEmployee) || 0;
    const esiDeduction = Number(structure?.esi) || 0;
    const professionalTax = Number(structure?.professionalTax) || 0;
    const tdsDeduction = Number(structure?.tds) || 0;

    const totalDeductions =
      pfDeduction + esiDeduction + professionalTax + tdsDeduction + lopDeduction;
    const netSalary = Math.max(0, baseFixedGross - totalDeductions);

    return {
      employee,
      structure,
      leaveSummary,
      preview: {
        month,
        year,
        totalWorkingDays: workingDays,
        daysWorked,
        paidLeaves,
        unpaidLeaves,
        payableDays,
        basicSalary,
        hra,
        da,
        conveyanceAllowance,
        medicalAllowance,
        specialAllowance,
        additionalIncentive: 0,
        incentiveNote: '',
        otherEarnings: 0,
        grossEarnings: baseFixedGross,
        pfDeduction,
        esiDeduction,
        professionalTax,
        tdsDeduction,
        lopDeduction,
        otherDeductions: 0,
        totalDeductions,
        netSalary,
      },
    };
  }

  private computeTotals(payload: Partial<EmployeeSalary>) {
    const totalWorkingDays = Number(payload.totalWorkingDays) || 30;
    const paidLeaves = Number(payload.paidLeaves) || 0;
    const unpaidLeaves = Number(payload.unpaidLeaves) || 0;
    const payableDays =
      payload.payableDays !== undefined
        ? Number(payload.payableDays)
        : Math.max(0, totalWorkingDays - unpaidLeaves);
    const daysWorked =
      payload.daysWorked !== undefined
        ? Number(payload.daysWorked)
        : Math.max(0, payableDays - paidLeaves);

    const basicSalary = Number(payload.basicSalary) || 0;
    const hra = Number(payload.hra) || 0;
    const da = Number(payload.da) || 0;
    const conveyanceAllowance = Number(payload.conveyanceAllowance) || 0;
    const medicalAllowance = Number(payload.medicalAllowance) || 0;
    const specialAllowance = Number(payload.specialAllowance) || 0;
    const additionalIncentive = Number(payload.additionalIncentive) || 0;
    const otherEarnings = Number(payload.otherEarnings) || 0;

    const grossEarnings =
      Math.round(
        (basicSalary +
          hra +
          da +
          conveyanceAllowance +
          medicalAllowance +
          specialAllowance +
          additionalIncentive +
          otherEarnings) *
          100,
      ) / 100;

    const pfDeduction = Number(payload.pfDeduction) || 0;
    const esiDeduction = Number(payload.esiDeduction) || 0;
    const professionalTax = Number(payload.professionalTax) || 0;
    const tdsDeduction = Number(payload.tdsDeduction) || 0;
    const lopDeduction = Number(payload.lopDeduction) || 0;
    const otherDeductions = Number(payload.otherDeductions) || 0;

    const totalDeductions =
      Math.round(
        (pfDeduction +
          esiDeduction +
          professionalTax +
          tdsDeduction +
          lopDeduction +
          otherDeductions) *
          100,
      ) / 100;

    const netSalary =
      Math.round(Math.max(0, grossEarnings - totalDeductions) * 100) / 100;

    return {
      totalWorkingDays,
      daysWorked,
      paidLeaves,
      unpaidLeaves,
      payableDays,
      basicSalary,
      hra,
      da,
      conveyanceAllowance,
      medicalAllowance,
      specialAllowance,
      additionalIncentive,
      otherEarnings,
      grossEarnings,
      pfDeduction,
      esiDeduction,
      professionalTax,
      tdsDeduction,
      lopDeduction,
      otherDeductions,
      totalDeductions,
      netSalary,
    };
  }

  async findAll(
    organizationId: string,
    params: {
      page?: number;
      limit?: number;
      month?: number;
      year?: number;
      status?: string;
      employeeId?: string;
      search?: string;
    },
  ) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;

    const qb = this.salaryRepository
      .createQueryBuilder('salary')
      .leftJoinAndSelect('salary.employee', 'employee')
      .leftJoinAndSelect('employee.branch', 'branch')
      .leftJoinAndSelect('salary.createdBy', 'createdBy')
      .where('salary.organizationId = :organizationId', { organizationId });

    if (params.month) {
      qb.andWhere('salary.month = :month', { month: Number(params.month) });
    }

    if (params.year) {
      qb.andWhere('salary.year = :year', { year: Number(params.year) });
    }

    if (params.status && params.status !== 'all') {
      qb.andWhere('salary.status = :status', { status: params.status });
    }

    if (params.employeeId && params.employeeId !== 'all') {
      qb.andWhere('salary.employeeId = :employeeId', {
        employeeId: params.employeeId,
      });
    }

    if (params.search) {
      qb.andWhere(
        '(LOWER(employee.name) LIKE :search OR LOWER(employee.email) LIKE :search OR LOWER(salary.slipNumber) LIKE :search)',
        { search: `%${params.search.toLowerCase()}%` },
      );
    }

    // Clone query for summary KPIs across matching period
    const summaryRecords = await qb.clone().getMany();

    const summary = {
      totalRecords: summaryRecords.length,
      totalPayroll: summaryRecords.reduce(
        (sum, r) => sum + Number(r.netSalary || 0),
        0,
      ),
      totalGross: summaryRecords.reduce(
        (sum, r) => sum + Number(r.grossEarnings || 0),
        0,
      ),
      totalIncentives: summaryRecords.reduce(
        (sum, r) => sum + Number(r.additionalIncentive || 0),
        0,
      ),
      paidCount: summaryRecords.filter((r) => r.status === SalaryStatus.PAID)
        .length,
      processedCount: summaryRecords.filter(
        (r) => r.status === SalaryStatus.PROCESSED,
      ).length,
      draftCount: summaryRecords.filter((r) => r.status === SalaryStatus.DRAFT)
        .length,
      emailSentCount: summaryRecords.filter((r) => !!r.emailSentAt).length,
    };

    const [data, total] = await qb
      .orderBy('salary.year', 'DESC')
      .addOrderBy('salary.month', 'DESC')
      .addOrderBy('salary.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Attach salaryStructure for each employee in data
    const empIds = Array.from(new Set(data.map((d) => d.employeeId)));
    const structures =
      empIds.length > 0
        ? await this.structureRepository.find({
            where: { employeeId: In(empIds), organizationId },
          })
        : [];
    const structMap = new Map(structures.map((s) => [s.employeeId, s]));

    const enrichedData = data.map((s) => ({
      ...s,
      salaryStructure: structMap.get(s.employeeId) || null,
    }));

    return {
      data: enrichedData,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findMySalaries(userId: string, organizationId: string) {
    const employee = await this.leaveService.getEmployeeByUserId(
      userId,
      organizationId,
    );
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!employee) {
      return {
        employee: null,
        structure: null,
        salaries: [],
        organization,
      };
    }

    const [structure, salaries] = await Promise.all([
      this.structureRepository.findOne({
        where: { employeeId: employee.id, organizationId },
      }),
      this.salaryRepository.find({
        where: { employeeId: employee.id, organizationId },
        relations: ['employee', 'employee.branch', 'createdBy'],
        order: { year: 'DESC', month: 'DESC', createdAt: 'DESC' },
      }),
    ]);

    const enrichedSalaries = salaries.map((s) => ({
      ...s,
      salaryStructure: structure || null,
    }));

    return {
      employee,
      structure,
      salaries: enrichedSalaries,
      organization,
    };
  }

  async findOne(id: string, organizationId: string) {
    const salary = await this.salaryRepository.findOne({
      where: { id, organizationId },
      relations: ['employee', 'employee.branch', 'organization', 'createdBy'],
    });

    if (!salary) {
      throw new NotFoundException('Salary record not found');
    }

    const salaryStructure = await this.structureRepository.findOne({
      where: { employeeId: salary.employeeId, organizationId },
    });

    return {
      ...salary,
      salaryStructure: salaryStructure || null,
    };
  }

  async create(
    organizationId: string,
    userId: string,
    payload: any,
  ) {
    const employee = await this.employeeRepository.findOne({
      where: { id: payload.employeeId, organizationId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found in this organization');
    }

    const month = Number(payload.month);
    const year = Number(payload.year);
    if (!month || month < 1 || month > 12 || !year) {
      throw new BadRequestException('Valid month (1-12) and year are required');
    }

    const existing = await this.salaryRepository.findOne({
      where: { employeeId: employee.id, organizationId, month, year },
    });
    if (existing) {
      throw new BadRequestException(
        `A salary slip (${existing.slipNumber}) already exists for ${employee.name} for ${MONTH_NAMES[month - 1]} ${year}`,
      );
    }

    const computed = this.computeTotals(payload);
    const slipNumber = await this.generateSlipNumber(organizationId, year, month);

    const salary = this.salaryRepository.create({
      slipNumber,
      employeeId: employee.id,
      organizationId,
      month,
      year,
      ...computed,
      incentiveNote: payload.incentiveNote || undefined,
      status: payload.status || SalaryStatus.PROCESSED,
      paymentDate: payload.paymentDate || null,
      paymentMethod: payload.paymentMethod || null,
      paymentReference: payload.paymentReference || null,
      remarks: payload.remarks || null,
      createdById: userId,
    });

    const saved = await this.salaryRepository.save(salary);

    // Optionally save base figures to employee's salary structure
    if (payload.saveToStructure) {
      await this.upsertStructure(employee.id, organizationId, userId, {
        basicSalary: computed.basicSalary,
        hra: computed.hra,
        da: computed.da,
        conveyanceAllowance: computed.conveyanceAllowance,
        medicalAllowance: computed.medicalAllowance,
        specialAllowance: computed.specialAllowance,
        pfEmployee: computed.pfDeduction,
        esi: computed.esiDeduction,
        professionalTax: computed.professionalTax,
        tds: computed.tdsDeduction,
        panNumber: payload.panNumber,
        uanNumber: payload.uanNumber,
        pfNumber: payload.pfNumber,
        esiNumber: payload.esiNumber,
        bankName: payload.bankName,
        accountNumber: payload.accountNumber,
        ifscCode: payload.ifscCode,
      });
    }

    try {
      await this.activityLogService.log(
        organizationId,
        userId,
        'salary_created',
        `Generated salary slip ${saved.slipNumber} for ${employee.name} (${MONTH_NAMES[month - 1]} ${year}) — Net ₹${computed.netSalary.toLocaleString('en-IN')}`,
        {
          salaryId: saved.id,
          entityId: saved.id,
          employeeId: employee.id,
          slipNumber: saved.slipNumber,
          netSalary: computed.netSalary,
          newStatus: saved.status,
        },
      );
    } catch (e) {
      console.error('Failed to log salary creation:', e);
    }

    return this.findOne(saved.id, organizationId);
  }

  async update(
    id: string,
    organizationId: string,
    userId: string,
    payload: any,
  ) {
    const existing = await this.salaryRepository.findOne({
      where: { id, organizationId },
      relations: ['employee'],
    });
    if (!existing) {
      throw new NotFoundException('Salary slip not found');
    }

    const previousStatus = existing.status;

    const merged = {
      ...existing,
      ...payload,
    };
    const computed = this.computeTotals(merged);

    Object.assign(existing, {
      ...computed,
      month: payload.month ? Number(payload.month) : existing.month,
      year: payload.year ? Number(payload.year) : existing.year,
      incentiveNote:
        payload.incentiveNote !== undefined
          ? payload.incentiveNote
          : existing.incentiveNote,
      status: payload.status ?? existing.status,
      paymentDate:
        payload.paymentDate !== undefined
          ? payload.paymentDate || null
          : existing.paymentDate,
      paymentMethod:
        payload.paymentMethod !== undefined
          ? payload.paymentMethod || null
          : existing.paymentMethod,
      paymentReference:
        payload.paymentReference !== undefined
          ? payload.paymentReference || null
          : existing.paymentReference,
      remarks:
        payload.remarks !== undefined ? payload.remarks : existing.remarks,
    });

    await this.salaryRepository.save(existing);

    try {
      const action =
        payload.status && payload.status !== previousStatus
          ? `salary_status_${payload.status}`
          : 'salary_updated';
      await this.activityLogService.log(
        organizationId,
        userId,
        action,
        `Updated salary slip ${existing.slipNumber} for ${existing.employee?.name || 'Employee'} (Net ₹${computed.netSalary.toLocaleString('en-IN')})`,
        {
          salaryId: existing.id,
          entityId: existing.id,
          employeeId: existing.employeeId,
          slipNumber: existing.slipNumber,
          previousStatus,
          newStatus: existing.status,
          netSalary: computed.netSalary,
        },
      );
    } catch (e) {
      console.error('Failed to log salary update:', e);
    }

    return this.findOne(id, organizationId);
  }

  async remove(
    id: string,
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const existing = await this.salaryRepository.findOne({
      where: { id, organizationId },
      relations: ['employee'],
    });
    if (!existing) {
      throw new NotFoundException('Salary slip not found');
    }
    await this.salaryRepository.remove(existing);

    try {
      await this.activityLogService.log(
        organizationId,
        userId,
        'salary_deleted',
        `Deleted salary slip ${existing.slipNumber} for ${existing.employee?.name || 'Employee'}`,
        {
          employeeId: existing.employeeId,
          slipNumber: existing.slipNumber,
        },
      );
    } catch (e) {
      console.error('Failed to log salary deletion:', e);
    }
  }

  private buildSalarySlipEmailHTML(
    salary: EmployeeSalary,
    employee: Employee,
    organization: Organization | null,
    structure: EmployeeSalaryStructure | null,
  ): string {
    const color = organization?.salarySlipColor || '#2563eb';
    const rawFields = organization?.salarySlipFields;
    const fields =
      typeof rawFields === 'string'
        ? JSON.parse(rawFields)
        : rawFields || {};

    const companyTitle =
      fields.companyHeaderText || organization?.name || 'Trekora Organization';
    const companyAddress =
      fields.companyAddressText || organization?.domain || '';
    const customFooter =
      fields.customFooterText ||
      'This is a computer-generated salary slip and does not require a physical signature.';

    const monthName = MONTH_NAMES[(salary.month || 1) - 1] || 'Month';
    const periodLabel = `${monthName} ${salary.year}`;
    const fmt = (val: any) =>
      `₹${Number(val || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Salary Slip - ${periodLabel}</title>
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #1f2937;">
        <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <!-- Header Banner -->
          <div style="background-color: ${color}; color: #ffffff; padding: 24px 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h1 style="margin: 0; font-size: 22px; font-weight: 700;">${companyTitle}</h1>
                ${companyAddress ? `<p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">${companyAddress}</p>` : ''}
              </div>
              <div style="text-align: right;">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.85;">Payslip For</div>
                <div style="font-size: 18px; font-weight: 700;">${periodLabel}</div>
                <div style="font-size: 12px; opacity: 0.9;">#${salary.slipNumber}</div>
              </div>
            </div>
          </div>

          <div style="padding: 28px;">
            <p style="margin: 0 0 18px; font-size: 14px; color: #374151;">
              Dear <strong>${employee.name}</strong>,<br/>
              Please find below your salary slip details for <strong>${periodLabel}</strong>.
            </p>

            <!-- Employee & Statutory Summary -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #6b7280;">Employee Name</td>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: 600;">${employee.name}</td>
                <td style="padding: 10px 14px; font-size: 12px; color: #6b7280;">Designation</td>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: 600;">${employee.designation || 'N/A'}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 10px 14px; font-size: 12px; color: #6b7280;">Bank / Account</td>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: 600;">${structure?.bankName ? `${structure.bankName} (${structure.accountNumber || 'N/A'})` : 'N/A'}</td>
                <td style="padding: 10px 14px; font-size: 12px; color: #6b7280;">PAN / UAN</td>
                <td style="padding: 10px 14px; font-size: 13px; font-weight: 600;">${structure?.panNumber || 'N/A'} / ${structure?.uanNumber || 'N/A'}</td>
              </tr>
            </table>

            <!-- Attendance & Leave Summary -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; text-align: center; border: 1px solid #e5e7eb; border-radius: 8px;">
              <tr style="background: #f3f4f6; font-size: 11px; text-transform: uppercase; color: #4b5563;">
                <th style="padding: 8px; border-right: 1px solid #e5e7eb;">Working Days</th>
                <th style="padding: 8px; border-right: 1px solid #e5e7eb;">Days Worked</th>
                <th style="padding: 8px; border-right: 1px solid #e5e7eb;">Paid Leaves</th>
                <th style="padding: 8px; border-right: 1px solid #e5e7eb;">LOP / Unpaid</th>
                <th style="padding: 8px;">Payable Days</th>
              </tr>
              <tr style="font-size: 14px; font-weight: 700;">
                <td style="padding: 10px; border-right: 1px solid #e5e7eb;">${salary.totalWorkingDays}</td>
                <td style="padding: 10px; border-right: 1px solid #e5e7eb;">${salary.daysWorked}</td>
                <td style="padding: 10px; border-right: 1px solid #e5e7eb; color: #059669;">${salary.paidLeaves}</td>
                <td style="padding: 10px; border-right: 1px solid #e5e7eb; color: #e11d48;">${salary.unpaidLeaves}</td>
                <td style="padding: 10px; color: ${color};">${salary.payableDays}</td>
              </tr>
            </table>

            <!-- Earnings & Deductions Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background-color: ${color}; color: #ffffff; font-size: 12px; text-transform: uppercase;">
                  <th style="padding: 10px 12px; text-align: left;">Earnings</th>
                  <th style="padding: 10px 12px; text-align: right; border-right: 1px solid rgba(255,255,255,0.2);">Amount</th>
                  <th style="padding: 10px 12px; text-align: left;">Deductions</th>
                  <th style="padding: 10px 12px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody style="font-size: 13px;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 9px 12px;">Basic Salary</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600; border-right: 1px solid #e5e7eb;">${fmt(salary.basicSalary)}</td>
                  <td style="padding: 9px 12px;">Provident Fund (EPF)</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600;">${fmt(salary.pfDeduction)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
                  <td style="padding: 9px 12px;">House Rent Allowance (HRA)</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600; border-right: 1px solid #e5e7eb;">${fmt(salary.hra)}</td>
                  <td style="padding: 9px 12px;">Employee State Insurance (ESI)</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600;">${fmt(salary.esiDeduction)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 9px 12px;">Dearness Allowance (DA)</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600; border-right: 1px solid #e5e7eb;">${fmt(salary.da)}</td>
                  <td style="padding: 9px 12px;">Professional Tax (PT)</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600;">${fmt(salary.professionalTax)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
                  <td style="padding: 9px 12px;">Conveyance Allowance</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600; border-right: 1px solid #e5e7eb;">${fmt(salary.conveyanceAllowance)}</td>
                  <td style="padding: 9px 12px;">Income Tax (TDS)</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600;">${fmt(salary.tdsDeduction)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 9px 12px;">Medical Allowance</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600; border-right: 1px solid #e5e7eb;">${fmt(salary.medicalAllowance)}</td>
                  <td style="padding: 9px 12px;">Loss of Pay (LOP)</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600;">${fmt(salary.lopDeduction)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
                  <td style="padding: 9px 12px;">Special Allowance</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600; border-right: 1px solid #e5e7eb;">${fmt(salary.specialAllowance)}</td>
                  <td style="padding: 9px 12px;">Other Deductions</td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 600;">${fmt(salary.otherDeductions)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 9px 12px; color: #059669; font-weight: 600;">
                    Additional Incentive ${salary.incentiveNote ? `<span style="font-weight: 400; font-size: 11px; color: #6b7280;">(${salary.incentiveNote})</span>` : ''}
                  </td>
                  <td style="padding: 9px 12px; text-align: right; font-weight: 700; color: #059669; border-right: 1px solid #e5e7eb;">${fmt(salary.additionalIncentive)}</td>
                  <td style="padding: 9px 12px;"></td>
                  <td style="padding: 9px 12px;"></td>
                </tr>
                ${
                  Number(salary.otherEarnings) > 0
                    ? `<tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
                        <td style="padding: 9px 12px;">Other Earnings</td>
                        <td style="padding: 9px 12px; text-align: right; font-weight: 600; border-right: 1px solid #e5e7eb;">${fmt(salary.otherEarnings)}</td>
                        <td style="padding: 9px 12px;"></td>
                        <td style="padding: 9px 12px;"></td>
                      </tr>`
                    : ''
                }
                <tr style="background: #f3f4f6; font-weight: 700;">
                  <td style="padding: 11px 12px;">Gross Earnings</td>
                  <td style="padding: 11px 12px; text-align: right; border-right: 1px solid #e5e7eb;">${fmt(salary.grossEarnings)}</td>
                  <td style="padding: 11px 12px;">Total Deductions</td>
                  <td style="padding: 11px 12px; text-align: right; color: #e11d48;">${fmt(salary.totalDeductions)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Net Payable Highlight -->
            <div style="background: #f0fdf4; border: 2px solid ${color}; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <div>
                <div style="font-size: 12px; text-transform: uppercase; color: #4b5563; font-weight: 600;">Net Salary Payable (${periodLabel})</div>
                <div style="font-size: 24px; font-weight: 800; color: ${color}; margin-top: 2px;">${fmt(salary.netSalary)}</div>
              </div>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; font-size: 11px; color: #6b7280; text-align: center; white-space: pre-line;">
              ${customFooter}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendSalarySlipEmail(
    id: string,
    organizationId: string,
    userId: string,
  ) {
    const salary = await this.salaryRepository.findOne({
      where: { id, organizationId },
      relations: ['employee', 'organization'],
    });
    if (!salary) {
      throw new NotFoundException('Salary slip not found');
    }
    if (!salary.employee?.email) {
      throw new BadRequestException(
        `Employee ${salary.employee?.name || ''} does not have an email address configured`,
      );
    }

    const structure = await this.structureRepository.findOne({
      where: { employeeId: salary.employeeId, organizationId },
    });

    const monthName = MONTH_NAMES[(salary.month || 1) - 1] || '';
    const orgName = salary.organization?.name || 'Trekora';
    const subject = `Salary Slip for ${monthName} ${salary.year} - ${orgName} (${salary.slipNumber})`;
    const html = this.buildSalarySlipEmailHTML(
      salary,
      salary.employee,
      salary.organization,
      structure,
    );

    await this.mailerService.sendMail({
      to: salary.employee.email,
      subject,
      html,
    });

    salary.emailSentAt = new Date();
    salary.emailSentCount = (salary.emailSentCount || 0) + 1;
    await this.salaryRepository.save(salary);

    try {
      await this.activityLogService.log(
        organizationId,
        userId,
        'salary_email_sent',
        `Dispersed salary slip email (${salary.slipNumber}) to ${salary.employee.name} (${salary.employee.email})`,
        {
          salaryId: salary.id,
          entityId: salary.id,
          employeeId: salary.employeeId,
          slipNumber: salary.slipNumber,
          email: salary.employee.email,
        },
      );
    } catch (e) {
      console.error('Failed to log salary email dispersion:', e);
    }

    return this.findOne(salary.id, organizationId);
  }

  async bulkSendSalarySlipEmails(
    organizationId: string,
    userId: string,
    payload: {
      salaryIds?: string[];
      month?: number;
      year?: number;
    },
  ) {
    let targets: EmployeeSalary[] = [];

    if (payload.salaryIds && payload.salaryIds.length > 0) {
      targets = await this.salaryRepository.find({
        where: { id: In(payload.salaryIds), organizationId },
        relations: ['employee'],
      });
    } else if (payload.month && payload.year) {
      targets = await this.salaryRepository.find({
        where: {
          organizationId,
          month: Number(payload.month),
          year: Number(payload.year),
          status: In([SalaryStatus.PROCESSED, SalaryStatus.PAID]),
        },
        relations: ['employee'],
      });
    } else {
      throw new BadRequestException(
        'Provide either salaryIds or month and year to disperse salary slip emails',
      );
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: { employeeName: string; reason: string }[] = [];

    for (const sal of targets) {
      try {
        await this.sendSalarySlipEmail(sal.id, organizationId, userId);
        sentCount++;
      } catch (err: any) {
        failedCount++;
        errors.push({
          employeeName: sal.employee?.name || sal.slipNumber,
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return {
      totalTargeted: targets.length,
      sentCount,
      failedCount,
      errors,
    };
  }
}

