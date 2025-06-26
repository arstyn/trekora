import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IEmployeeCreateDTO } from '@repo/api/employee/dto/create-employee.dto';
import { DataSource, Repository } from 'typeorm';
import { RoleService } from '../role/role.service';
import { UserDepartments } from '../user-departments/entity/user-departments.entity';
import { UserDepartmentsService } from '../user-departments/user-departments.service';
import { Employee, EmployeeStatus } from './entity/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly userDepartmentsService: UserDepartmentsService,
    private readonly roleService: RoleService,
    private readonly dataSource: DataSource,
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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
      if (roleId) {
        const role = await this.roleService.findOne(roleId);
        if (!role) {
          throw new Error('Role not found');
        }
      }

      // Prepare update object
      const updateObj: any = {
        ...rest,
        roleId,
        status: status
          ? EmployeeStatus[status.toUpperCase() as keyof typeof EmployeeStatus]
          : undefined,
        joinDate: joinDate ? new Date(joinDate) : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      };

      // Remove undefined fields to avoid overwriting with undefined
      Object.keys(updateObj).forEach(
        (key) => updateObj[key] === undefined && delete updateObj[key],
      );

      await queryRunner.manager.update(Employee, id, updateObj);

      // Update departments if provided
      if (departments) {
        // Remove existing departments
        await this.userDepartmentsService.removeByEmployeeId(
          id,
          queryRunner.manager,
        );
        // Add new departments
        for (const departmentId of departments) {
          await this.userDepartmentsService.create(
            {
              departmentId,
              employeeId: id,
            },
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
        ],
      });

      await queryRunner.commitTransaction();

      return updatedEmployee!;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findProfile(id: string): Promise<Employee | null> {
  return this.employeeRepository.findOne({
    where: { id },
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


  // Delete an employee by ID
  async remove(id: string): Promise<void> {
    await this.employeeRepository.delete(id);
  }
}
