import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee, EmployeeStatus } from './entity/employee.entity';
import { IEmployeeCreateDTO } from '@repo/api/employee/dto/create-employee.dto';
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let employeeService: EmployeeService;

  const mockEmployeeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    terminate: jest.fn(),
    remove: jest.fn(),
  };

  const mockEmployee: Partial<Employee> = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    organizationId: 'org1',
    status: EmployeeStatus.ACTIVE,
    isActive: true,
  };

  const mockRequest: ApiRequestJWT = {
    user: {
      userId: 'user1',
      organizationId: 'org1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    employeeService = module.get<EmployeeService>(EmployeeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new employee', async () => {
      const employeeData: IEmployeeCreateDTO = {
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
      };

      mockEmployeeService.create.mockResolvedValue(mockEmployee);

      const result = await controller.create(mockRequest, employeeData);

      expect(mockEmployeeService.create).toHaveBeenCalledWith({
        ...employeeData,
        organizationId: mockRequest.user.organizationId,
      });
      expect(result).toEqual(mockEmployee);
    });

    it('should create an employee with all fields', async () => {
      const employeeData: IEmployeeCreateDTO = {
        name: 'John Doe',
        email: 'john@example.com',
        departments: ['dept1', 'dept2'],
        roleId: 'role1',
        status: 'active',
        joinDate: '2024-01-01',
        address: '123 Main St',
        phoneNumber: '1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        nationality: 'US',
        maritalStatus: 'single',
        emergencyContactName: [
          {
            name: 'Jane Doe',
            phoneNumber: '0987654321',
            relation: 'spouse',
          },
        ],
      };

      mockEmployeeService.create.mockResolvedValue(mockEmployee);

      const result = await controller.create(mockRequest, employeeData);

      expect(mockEmployeeService.create).toHaveBeenCalledWith({
        ...employeeData,
        organizationId: mockRequest.user.organizationId,
      });
      expect(result).toEqual(mockEmployee);
    });
  });

  describe('findAll', () => {
    it('should return an array of employees', async () => {
      const employees = [mockEmployee];
      mockEmployeeService.findAll.mockResolvedValue(employees);

      const result = await controller.findAll(mockRequest);

      expect(mockEmployeeService.findAll).toHaveBeenCalledWith(
        mockRequest.user.organizationId,
      );
      expect(result).toEqual(employees);
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      const employeeId = '1';
      mockEmployeeService.findOne.mockResolvedValue(mockEmployee);

      const result = await controller.findOne(employeeId);

      expect(mockEmployeeService.findOne).toHaveBeenCalledWith(employeeId);
      expect(result).toEqual(mockEmployee);
    });

    it('should return null when employee is not found', async () => {
      const employeeId = '999';
      mockEmployeeService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(employeeId);

      expect(mockEmployeeService.findOne).toHaveBeenCalledWith(employeeId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an employee', async () => {
      const employeeId = '1';
      const updateData: IEmployeeCreateDTO = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'active',
      };

      const updatedEmployee = { ...mockEmployee, ...updateData };
      mockEmployeeService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update(employeeId, updateData);

      expect(mockEmployeeService.update).toHaveBeenCalledWith(
        employeeId,
        updateData,
      );
      expect(result).toEqual(updatedEmployee);
    });
  });

  describe('terminate', () => {
    it('should terminate an employee', async () => {
      const employeeId = '1';
      const terminatedEmployee = {
        ...mockEmployee,
        status: EmployeeStatus.TERMINATED,
      };
      mockEmployeeService.terminate.mockResolvedValue(terminatedEmployee);

      const result = await controller.terminate(employeeId);

      expect(mockEmployeeService.terminate).toHaveBeenCalledWith(employeeId);
      expect(result).toEqual(terminatedEmployee);
    });
  });

  describe('remove', () => {
    it('should delete an employee', async () => {
      const employeeId = '1';
      mockEmployeeService.remove.mockResolvedValue(undefined);

      await controller.remove(employeeId);

      expect(mockEmployeeService.remove).toHaveBeenCalledWith(employeeId);
    });
  });
});
