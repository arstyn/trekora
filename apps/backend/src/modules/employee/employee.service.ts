import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Employee, EmployeeStatus } from 'src/database/entity/employee.entity';

import { UserDepartments } from 'src/database/entity/user-departments.entity';
import { User } from 'src/database/entity/user.entity';
import { IUserProfileDTO } from 'src/dto/user-profile.dto';
import { DataSource, Repository } from 'typeorm';
import { IEmployeeCreateDTO } from '../../dto/create-employee.dto';
import { UploadService } from '../upload/upload.service';
import { MailerService } from '../mailer/mailer.service';
import { PermissionSetService } from '../permission/permission-set.service';
import { UserDepartmentsService } from '../user-departments/user-departments.service';
import { UserInviteService } from '../user-invite/user-invite.service';
import { UserService } from '../user/user.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { UserInvite } from 'src/database/entity/user-invite.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly userDepartmentsService: UserDepartmentsService,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly userInviteService: UserInviteService,
    private readonly mailerService: MailerService,
    private readonly uploadService: UploadService,
    private readonly permissionSetService: PermissionSetService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  /**
   * Helper method to load permission sets for an employee
   * Since user and employee are always kept in sync, we only need to check employee
   */
  private async loadPermissionSetsForEmployee(
    employee: Employee,
  ): Promise<void> {
    // Get permission sets assigned to the employee
    // User and employee are always kept in sync, so we only need to check employee
    const permissionSets =
      await this.permissionSetService.getPermissionSetsForUser(
        employee.id,
      );

    // Attach permission sets to employee object
    (employee as any).permissionSets = permissionSets;
  }

  private async handleFileUploads(
    employeeId: string,
    files: Express.Multer.File[],
  ) {
    const fileUploads = {
      profilePhoto: undefined as string | undefined,
      verificationDocument: undefined as string | undefined,
    };

    // Handle profile photo
    const profilePhotoFile = files.find((f) => f.fieldname === 'profilePhoto');
    if (profilePhotoFile) {
      fileUploads.profilePhoto = await this.uploadService.uploadSingle(
        profilePhotoFile,
        'employee',
      );
    }

    // Handle verification document
    const verificationDocumentFile = files.find(
      (f) => f.fieldname === 'verificationDocument',
    );
    if (verificationDocumentFile) {
      fileUploads.verificationDocument = await this.uploadService.uploadSingle(
        verificationDocumentFile,
        'employee',
      );
    }

    return fileUploads;
  }

  // Create a new employee
  async create(
    employeeData: IEmployeeCreateDTO,
    files: Express.Multer.File[] = [],
  ) {
    const {
      emergencyContactName,
      departments,
      status,
      joinDate,
      dateOfBirth,
      ...rest
    } = employeeData;

    if (rest.managerId === '') (rest as any).managerId = null;
    if (rest.userId === '') (rest as any).userId = null;
    if (rest.branchId === '') (rest as any).branchId = null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employeeId = randomUUID();

      // Handle file uploads
      const fileUploads = await this.handleFileUploads(employeeId, files);

      const newEmployeeData = this.employeeRepository.create({
        ...rest,
        id: employeeId,
        status:
          EmployeeStatus[status.toUpperCase() as keyof typeof EmployeeStatus],
        joinDate: joinDate ? new Date(joinDate) : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        profilePhoto: fileUploads.profilePhoto,
        verificationDocument: fileUploads.verificationDocument,
      });

      const employee = await queryRunner.manager.save(newEmployeeData);

      const userDepartments: UserDepartments[] = [];

      if (departments) {
        for (const departmentId of departments) {
          const department = await this.userDepartmentsService.create(
            {
              departmentId,
              employeeId: employee.id,
            },
            queryRunner.manager, // pass manager for transactional consistency
          );
          userDepartments.push(department);
        }
      }

      const updatedEmployee = await queryRunner.manager.findOne(Employee, {
        where: { id: employee.id },
        relations: ['employeeDepartments', 'employeeDepartments.department'],
      });

      await queryRunner.commitTransaction();

      return updatedEmployee;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message ?? 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Get all employees
  async findAll(organizationId: string, showArchived = false): Promise<Employee[]> {
    const employees = await this.employeeRepository.find({
      where: {
        organizationId,
        isArchived: showArchived,
      },
      relations: ['manager'],
      order: { createdAt: 'DESC' },
    });

    // Load permission sets for each employee
    for (const employee of employees) {
      await this.loadPermissionSetsForEmployee(employee);
    }

    return employees;
  }

  // Get a single employee by ID
  async findOne(id: string): Promise<Employee | null> {
    const employee = await this.employeeRepository.findOne({ where: { id } });

    if (!employee) {
      return null;
    }

    await this.loadPermissionSetsForEmployee(employee);

    return employee;
  }
  // Get a single employee by ID
  async findOneWithEmail(email: string): Promise<Employee | null> {
    const employee = await this.employeeRepository.findOne({
      where: { email },
    });

    if (!employee) {
      return null;
    }

    await this.loadPermissionSetsForEmployee(employee);

    return employee;
  }

  async findOneWithFiles(id: string): Promise<Employee | null> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['user', 'manager', 'directReports'],
    });
    if (!employee) return null;

    // Get permission sets assigned directly to the employee
    const uniquePermissionSets =
      await this.permissionSetService.getPermissionSetsForUser(
        employee.id,
      );

    // Attach permission sets to employee object
    (employee as any).permissionSets = uniquePermissionSets;

    return employee;
  }

  // Update an employee by ID
  async update(
    id: string,
    updateData: Partial<IEmployeeCreateDTO>,
    files: Express.Multer.File[] = [],
    performedById?: string,
  ): Promise<Employee> {
    const {
      emergencyContactName,
      departments,
      status,
      joinDate,
      dateOfBirth,
      avatar,
      ...rest
    } = updateData;

    if (rest.managerId === '') (rest as any).managerId = null;
    if (rest.userId === '') (rest as any).userId = null;
    if (rest.branchId === '') (rest as any).branchId = null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 🔍 Find the employee first to get the linked userId
      const existingEmployee = await queryRunner.manager.findOne(Employee, {
        where: { id },
        relations: ['user'], // ensure user is loaded
      });

      if (!existingEmployee) {
        throw new Error('Employee not found');
      }

      // Handle file uploads
      const fileUploads = await this.handleFileUploads(id, files);

      const emailChanged = rest.email && rest.email !== existingEmployee.email;

      const updateObj: any = {
        ...rest,
        status: status
          ? EmployeeStatus[status.toUpperCase() as keyof typeof EmployeeStatus]
          : undefined,
        joinDate: joinDate ? new Date(joinDate) : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        ...(fileUploads.profilePhoto && {
          profilePhoto: fileUploads.profilePhoto,
        }),
        ...(fileUploads.verificationDocument && {
          verificationDocument: fileUploads.verificationDocument,
        }),
      };

      if (emailChanged) {
        updateObj.status = EmployeeStatus.PENDING_ACTIVATION;
        updateObj.isActive = false;
        updateObj.userId = null;
      }

      Object.keys(updateObj).forEach(
        (key) => updateObj[key] === undefined && delete updateObj[key],
      );

      // 🔄 Update the Employee
      await queryRunner.manager.update(Employee, id, updateObj);

      // 🔄 Update the User with common fields (only if email hasn't changed)
      if (existingEmployee.user?.id && !emailChanged) {
        const userUpdate: Partial<User> = {
          name: rest.name,
          phone: rest.phone,
          email: rest.email,
        };

        Object.keys(userUpdate).forEach(
          (key) => userUpdate[key] === undefined && delete userUpdate[key],
        );

        await queryRunner.manager.update(
          User,
          existingEmployee.user.id,
          userUpdate,
        );
      }

      // 🔄 Update departments
      if (departments) {
        await this.userDepartmentsService.removeByEmployeeId(
          id,
          queryRunner.manager,
        );
        for (const departmentId of departments) {
          await this.userDepartmentsService.create(
            { departmentId, employeeId: id },
            queryRunner.manager,
          );
        }
      }

      const updatedEmployee = await queryRunner.manager.findOne(Employee, {
        where: { id },
        relations: ['user'],
      });

      await queryRunner.commitTransaction();

      if (emailChanged && performedById) {
        await this.activityLogService.log(
          existingEmployee.organizationId,
          performedById,
          'employee_email_changed',
          `Changed email of employee ${existingEmployee.name} from ${existingEmployee.email} to ${rest.email} (Pending Activation)`,
          { employeeId: id, oldEmail: existingEmployee.email, newEmail: rest.email },
        );
      }

      // Load permission sets for the updated employee
      if (updatedEmployee) {
        await this.loadPermissionSetsForEmployee(updatedEmployee);
      }

      return updatedEmployee!;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message ?? 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async terminate(id: string): Promise<Employee | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id },
        relations: ['employeeDepartments'],
      });

      if (!employee) {
        throw new Error('Employee not found');
      }

      // Update employee status to terminated
      employee.status = EmployeeStatus.TERMINATED;
      await queryRunner.manager.save(employee);

      // Remove all departments associated with the employee
      await this.userDepartmentsService.removeByEmployeeId(
        id,
        queryRunner.manager,
      );

      const terminatedEmployee = await queryRunner.manager.findOne(Employee, {
        where: { id },
        relations: [],
      });

      await queryRunner.commitTransaction();

      // Load permission sets for the terminated employee
      if (terminatedEmployee) {
        await this.loadPermissionSetsForEmployee(terminatedEmployee);
      }

      return terminatedEmployee;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message ?? 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findProfile(id: string, organizationId: string): Promise<Employee | null> {
    const employee = await this.employeeRepository.findOne({
      where: { userId: id, organizationId },
      relations: {
        branch: true,
        organization: true,
        user: true,
      },
    });

    if (!employee) {
      return null;
    }

    await this.loadPermissionSetsForEmployee(employee);

    return employee;
  }

  async activateUser(id: string, performedById: string) {
    try {
      const employee = await this.findOne(id);

      if (!employee) {
        throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
      }

      if (employee.status === EmployeeStatus.ACTIVE) {
        throw new HttpException('Employee is already active.', HttpStatus.BAD_REQUEST);
      }

      // Check if an invite already exists
      const existingInvite = await this.dataSource.getRepository(UserInvite).findOne({
        where: { employeeId: employee.id },
      });
      const isResend = !!existingInvite;

      // Create invite
      const invite = await this.userInviteService.createInvite(employee);

      // Send invite email (implement sendInviteEmail)
      await this.sendInviteEmail(employee.email ?? '', invite.token);

      // Log action
      const action = isResend ? 'invite_resent' : 'invite_sent';
      const details = isResend
        ? `Resent invitation to ${employee.name} (${employee.email})`
        : `Sent invitation to ${employee.name} (${employee.email})`;
      await this.activityLogService.log(
        employee.organizationId,
        performedById,
        action,
        details,
        { employeeId: employee.id, email: employee.email },
      );

      return { message: isResend ? 'Invite resent successfully' : 'Invite sent successfully' };
    } catch (error: any) {
      throw new HttpException(
        error.message ?? 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Placeholder for sending invite email
  async sendInviteEmail(email: string, token: string) {
    const inviteUrl = `${process.env.FRONTEND_URL}/activate-user-account/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background: #f4f4f7; padding: 40px 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h2 style="color: #333; margin-bottom: 16px;">You're Invited to Join Trekora!</h2>
              <p style="color: #555; font-size: 16px; margin-bottom: 32px;">Click the button below to activate your account and get started.</p>
              <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background: #4f46e5; color: #fff; border-radius: 6px; text-decoration: none; font-size: 18px; font-weight: bold; margin-bottom: 24px;">Activate Account</a>
              <p style="color: #888; font-size: 13px; margin-top: 32px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4f46e5; font-size: 14px;">${inviteUrl}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 40px 40px; text-align: center; color: #aaa; font-size: 12px;">
              &copy; ${new Date().getFullYear()} Trekora. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
    `;

    await this.mailerService.sendMail({
      to: email,
      subject: 'You are invited to join Trekora!',
      text: `Activate your account: ${inviteUrl}`,
      html,
    });
  }

  // Delete an employee by ID
  async remove(id: string): Promise<void> {
    await this.employeeRepository.delete(id);
  }

  async getProfile(userId: string, organizationId: string): Promise<IUserProfileDTO | null> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: userId }, organizationId },
      relations: ['branch'],
    });

    if (!employee) return null;

    const department =
      employee.employeeDepartments && employee.employeeDepartments.length > 0
        ? employee.employeeDepartments[0].department.name
        : null;

    return {
      username: employee.name,
      email: employee.email ?? '',
      mobileNumber: employee.phone ?? '',
      position: (employee as any).permissionSets?.[0]?.name ?? '',
      department,
      location: employee.branch?.name ?? null,
    };
  }

  // Get team hierarchy (employees with their managers and direct reports)
  async getTeamHierarchy(organizationId: string): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: {
        organizationId,
        status: EmployeeStatus.ACTIVE,
      },
      relations: [
        'employeeDepartments',
        'employeeDepartments.department',
        'manager',
        'directReports',
      ],
      order: { name: 'ASC' },
    });
  }

  // Get direct reports for a specific manager
  async getDirectReports(managerId: string): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: {
        managerId,
        status: EmployeeStatus.ACTIVE,
      },
      relations: ['directReports'],
      order: { name: 'ASC' },
    });
  }

  async findUserOrganizations(userId: string): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: {
        userId,
        status: EmployeeStatus.ACTIVE,
        isActive: true,
      },
      relations: ['organization'],
    });
  }

  async findOneByUserIdAndOrgId(userId: string, organizationId: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({
      where: {
        userId,
        organizationId,
        status: EmployeeStatus.ACTIVE,
        isActive: true,
      },
      relations: ['organization'],
    });
  }

  async reactivate(id: string, performedById: string): Promise<Employee | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!employee) {
        throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
      }

      if (employee.status !== EmployeeStatus.TERMINATED) {
        throw new HttpException('Employee is not terminated', HttpStatus.BAD_REQUEST);
      }

      // Update employee status to active
      employee.status = EmployeeStatus.ACTIVE;
      employee.isActive = true;
      await queryRunner.manager.save(employee);

      // If there's an associated user, activate them too
      if (employee.userId) {
        await queryRunner.manager.update(User, employee.userId, {
          isActive: true,
        });
      }

      await queryRunner.commitTransaction();

      const reactivatedEmployee = await this.findOneWithFiles(id);

      // Log action
      await this.activityLogService.log(
        employee.organizationId,
        performedById,
        'employee_reactivated',
        `Reactivated employee ${employee.name} (${employee.email})`,
        { employeeId: employee.id },
      );

      return reactivatedEmployee;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message ?? 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async archive(id: string, performedById: string): Promise<Employee | null> {
    const employee = await this.findOne(id);
    if (!employee) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }

    employee.isArchived = true;
    const archivedEmployee = await this.employeeRepository.save(employee);

    // Log action
    await this.activityLogService.log(
      employee.organizationId,
      performedById,
      'employee_archived',
      `Archived employee ${employee.name} (${employee.email})`,
      { employeeId: employee.id },
    );

    return archivedEmployee;
  }

  async unarchive(id: string, performedById: string): Promise<Employee | null> {
    const employee = await this.findOne(id);
    if (!employee) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }

    employee.isArchived = false;
    const unarchivedEmployee = await this.employeeRepository.save(employee);

    // Log action
    await this.activityLogService.log(
      employee.organizationId,
      performedById,
      'employee_unarchived',
      `Unarchived employee ${employee.name} (${employee.email})`,
      { employeeId: employee.id },
    );

    return unarchivedEmployee;
  }
}
