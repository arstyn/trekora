import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { Department } from './entity/department.entity';

describe('DepartmentController', () => {
  let controller: DepartmentController;
  let departmentService: DepartmentService;

  const mockDepartmentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockDepartment: Partial<Department> = {
    id: '1',
    name: 'Engineering',
    description: 'Software Engineering Department',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [
        {
          provide: DepartmentService,
          useValue: mockDepartmentService,
        },
      ],
    }).compile();

    controller = module.get<DepartmentController>(DepartmentController);
    departmentService = module.get<DepartmentService>(DepartmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new department', async () => {
      const departmentData: Partial<Department> = {
        name: 'Engineering',
        description: 'Software Engineering Department',
      };

      mockDepartmentService.create.mockResolvedValue(mockDepartment);

      const result = await controller.create(departmentData);

      expect(mockDepartmentService.create).toHaveBeenCalledWith(departmentData);
      expect(result).toEqual(mockDepartment);
    });

    it('should create a department with minimal data', async () => {
      const departmentData: Partial<Department> = {
        name: 'Engineering',
      };

      const minimalDept = { ...mockDepartment, description: undefined };
      mockDepartmentService.create.mockResolvedValue(minimalDept);

      const result = await controller.create(departmentData);

      expect(mockDepartmentService.create).toHaveBeenCalledWith(departmentData);
      expect(result).toEqual(minimalDept);
    });
  });

  describe('findAll', () => {
    it('should return an array of departments', async () => {
      const departments = [mockDepartment];
      mockDepartmentService.findAll.mockResolvedValue(departments);

      const result = await controller.findAll();

      expect(mockDepartmentService.findAll).toHaveBeenCalled();
      expect(result).toEqual(departments);
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      const departmentId = '1';
      mockDepartmentService.findOne.mockResolvedValue(mockDepartment);

      const result = await controller.findOne(departmentId);

      expect(mockDepartmentService.findOne).toHaveBeenCalledWith(departmentId);
      expect(result).toEqual(mockDepartment);
    });

    it('should return null when department is not found', async () => {
      const departmentId = '999';
      mockDepartmentService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(departmentId);

      expect(mockDepartmentService.findOne).toHaveBeenCalledWith(departmentId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a department', async () => {
      const departmentId = '1';
      const updateData: Partial<Department> = {
        name: 'Product Engineering',
        description: 'Updated description',
      };

      const updatedDepartment = { ...mockDepartment, ...updateData };
      mockDepartmentService.update.mockResolvedValue(updatedDepartment);

      const result = await controller.update(departmentId, updateData);

      expect(mockDepartmentService.update).toHaveBeenCalledWith(
        departmentId,
        updateData,
      );
      expect(result).toEqual(updatedDepartment);
    });

    it('should handle partial updates', async () => {
      const departmentId = '1';
      const updateData: Partial<Department> = {
        name: 'Product Engineering',
      };

      const updatedDepartment = { ...mockDepartment, ...updateData };
      mockDepartmentService.update.mockResolvedValue(updatedDepartment);

      const result = await controller.update(departmentId, updateData);

      expect(mockDepartmentService.update).toHaveBeenCalledWith(
        departmentId,
        updateData,
      );
      expect(result).toEqual(updatedDepartment);
    });
  });

  describe('remove', () => {
    it('should delete a department', async () => {
      const departmentId = '1';
      mockDepartmentService.remove.mockResolvedValue(undefined);

      await controller.remove(departmentId);

      expect(mockDepartmentService.remove).toHaveBeenCalledWith(departmentId);
    });
  });
});
