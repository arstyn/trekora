import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Employee, EmployeeStatus } from 'src/database/entity/employee.entity';
import { RelatedType } from 'src/database/entity/file-manager.entity';
import { UserDepartments } from 'src/database/entity/user-departments.entity';
import { User } from 'src/database/entity/user.entity';
import { IUserProfileDTO } from 'src/dto/user-profile.dto';
import { DataSource, Repository } from 'typeorm';
import { IEmployeeCreateDTO } from '../../dto/create-employee.dto';
import { FileManagerService } from '../file-manager/file-manager.service';
import { MailerService } from '../mailer/mailer.service';
import { PermissionSetService } from '../permission/permission-set.service';
import { UserDepartmentsService } from '../user-departments/user-departments.service';
import { UserInviteService } from '../user-invite/user-invite.service';
import { UserService } from '../user/user.service';

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
    private readonly fileManagerService: FileManagerService,
    private readonly permissionSetService: PermissionSetService,
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
        undefined,
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
      const fileData = await this.fileManagerService.uploadOneFile(
        { relatedId: employeeId, relatedType: RelatedType.EMPLOYEE },
        profilePhotoFile,
      );
      fileUploads.profilePhoto = fileData.id;
    }

    // Handle verification document
    const verificationDocumentFile = files.find(
      (f) => f.fieldname === 'verificationDocument',
    );
    if (verificationDocumentFile) {
      const fileData = await this.fileManagerService.uploadOneFile(
        { relatedId: employeeId, relatedType: RelatedType.EMPLOYEE },
        verificationDocumentFile,
      );
      fileUploads.verificationDocument = fileData.id;
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
  async findAll(organizationId: string): Promise<Employee[]> {
    const employees = await this.employeeRepository.find({
      where: {
        organizationId,
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
    const employeePermissionSets =
      await this.permissionSetService.getPermissionSetsForUser(
        undefined,
        employee.id,
      );

    // If employee has a linked user, also get permission sets assigned to the user
    let userPermissionSets: any[] = [];
    if (employee.userId) {
      userPermissionSets =
        await this.permissionSetService.getPermissionSetsForUser(
          employee.userId,
          undefined,
        );
    }

    // Combine both sets and remove duplicates
    const allPermissionSets = [
      ...employeePermissionSets,
      ...userPermissionSets,
    ];
    const uniquePermissionSets = Array.from(
      new Map(allPermissionSets.map((ps) => [ps.id, ps])).values(),
    );

    // Attach permission sets to employee object
    (employee as any).permissionSets = uniquePermissionSets;

    // Get file URLs for photo fields
    const files = await this.fileManagerService.findByRelatedEntity(
      id,
      RelatedType.EMPLOYEE,
    );

    // Map file IDs to URLs
    const fileMap = new Map(files.map((f) => [f.id, f.url]));

    return {
      ...employee,
      profilePhoto: employee.profilePhoto
        ? fileMap.get(employee.profilePhoto)
        : undefined,
      verificationDocument: employee.verificationDocument
        ? fileMap.get(employee.verificationDocument)
        : undefined,
    } as Employee;
  }

  // Update an employee by ID
  async update(
    id: string,
    updateData: Partial<IEmployeeCreateDTO>,
    files: Express.Multer.File[] = [],
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
    console.log(
      '🚀 ~ employee.service.ts:141 ~ EmployeeService ~ update ~ rest:',
      rest,
    );

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

      Object.keys(updateObj).forEach(
        (key) => updateObj[key] === undefined && delete updateObj[key],
      );

      // 🔄 Update the Employee
      await queryRunner.manager.update(Employee, id, updateObj);

      // 🔄 Update the User with common fields
      if (existingEmployee.user?.id) {
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

  async findProfile(id: string): Promise<Employee | null> {
    const employee = await this.employeeRepository.findOne({
      where: { userId: id },
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

  async activateUser(id: string) {
    try {
      const employee = await this.findOne(id);

      if (!employee) {
        throw new Error('Employee not found');
      }

      const user = await this.userService.findOneWithEmail(
        employee.email ?? '',
      );
      if (user) {
        throw Error('User Already Exists');
      }

      // Create invite
      const invite = await this.userInviteService.createInvite(employee);

      // Send invite email (implement sendInviteEmail)
      await this.sendInviteEmail(employee.email ?? '', invite.token);

      return { message: 'Invite sent' };
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

  async getProfile(userId: string): Promise<IUserProfileDTO | null> {
    const employee = await this.employeeRepository.findOne({
      where: { user: { id: userId } },
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
}
