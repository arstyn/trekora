import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IEmployeeCreateDTO } from '@repo/api/employee/dto/create-employee.dto';
import { DataSource, Repository } from 'typeorm';
import { RoleService } from '../role/role.service';
import { UserDepartmentsService } from '../user-departments/user-departments.service';
import { IUserProfileDTO } from '@repo/api/user/dto/user-profile.dto';
import { UserService } from '../user/user.service';
import { UserInviteService } from '../user-invite/user-invite.service';
import { MailerService } from '../mailer/mailer.service';
import { Employee, EmployeeStatus } from 'src/database/entity/employee.entity';
import { UserDepartments } from 'src/database/entity/user-departments.entity';
import { User } from 'src/database/entity/user.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly userDepartmentsService: UserDepartmentsService,
    private readonly roleService: RoleService,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly userInviteService: UserInviteService,
    private readonly mailerService: MailerService,
  ) {}

  // Create a new employee
  async create(employeeData: IEmployeeCreateDTO) {
    const {
      roleId,
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
      if (roleId) {
        const role = await this.roleService.findOne(roleId);
        if (!role) {
          throw new Error('Role not found');
        }
      }

      const employee = this.employeeRepository.create({
        ...rest,
        status:
          EmployeeStatus[status.toUpperCase() as keyof typeof EmployeeStatus],
        joinDate: joinDate ? new Date(joinDate) : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        roleId,
      });

      await queryRunner.manager.save(employee);

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
        relations: [
          'role',
          'employeeDepartments',
          'employeeDepartments.department',
        ],
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
    return this.employeeRepository.find({
      where: {
        organizationId,
      },
      relations: [
        'role',
        'employeeDepartments',
        'employeeDepartments.department',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  // Get a single employee by ID
  async findOne(id: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { id } });
  }

  // Update an employee by ID

  // Update an employee by ID
  async update(id: string, updateData: IEmployeeCreateDTO): Promise<Employee> {
    const {
      roleId,
      emergencyContactName,
      departments,
      status,
      joinDate,
      dateOfBirth,
      avatar,
      ...rest
    } = updateData;

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

      if (roleId) {
        const role = await this.roleService.findOne(roleId);
        if (!role) {
          throw new Error('Role not found');
        }
      }

      const updateObj: any = {
        ...rest,
        roleId,
        status: status
          ? EmployeeStatus[status.toUpperCase() as keyof typeof EmployeeStatus]
          : undefined,
        joinDate: joinDate ? new Date(joinDate) : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
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
        relations: [
          'role',
          'employeeDepartments',
          'employeeDepartments.department',
          'user',
        ],
      });

      await queryRunner.commitTransaction();
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

  async terminate(id: string): Promise<Employee> {
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
        relations: [
          'role',
          'employeeDepartments',
          'employeeDepartments.department',
        ],
      });

      await queryRunner.commitTransaction();

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
    return this.employeeRepository.findOne({
      where: { userId: id },
      relations: {
        role: true,
        branch: true,
        organization: true,
        user: true,
        employeeDepartments: {
          department: true,
        },
      },
    });
  }

  async activateUser(id: string) {
    try {
      const employee = await this.findOne(id);

      if (!employee) {
        throw new Error('Employee not found');
      }

      const user = await this.userService.findOneWithEmail(employee.email);
      if (user) {
        throw Error('User Already Exists');
      }

      // Create invite
      const invite = await this.userInviteService.createInvite(employee);

      // Send invite email (implement sendInviteEmail)
      await this.sendInviteEmail(employee.email, invite.token);

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
    const inviteUrl = `${process.env.FRONTEND_URL}/activate-account/${token}`;

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
      relations: [
        'role',
        'employeeDepartments',
        'employeeDepartments.department',
        'branch',
      ],
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
      position: employee.role?.name ?? '',
      department,
      location: employee.branch?.name ?? null,
    };
  }
}
