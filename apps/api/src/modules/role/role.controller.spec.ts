import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from './entity/role.entity';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: RoleService;

  const mockRoleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRole: Partial<Role> = {
    id: '1',
    name: 'Admin',
    description: 'Administrator role with full access',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    roleService = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const roleData: Partial<Role> = {
        name: 'Admin',
        description: 'Administrator role with full access',
      };

      mockRoleService.create.mockResolvedValue(mockRole);

      const result = await controller.create(roleData);

      expect(mockRoleService.create).toHaveBeenCalledWith(roleData);
      expect(result).toEqual(mockRole);
    });

    it('should create a role with minimal data', async () => {
      const roleData: Partial<Role> = {
        name: 'Admin',
      };

      const minimalRole = { ...mockRole, description: undefined };
      mockRoleService.create.mockResolvedValue(minimalRole);

      const result = await controller.create(roleData);

      expect(mockRoleService.create).toHaveBeenCalledWith(roleData);
      expect(result).toEqual(minimalRole);
    });
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const roles = [mockRole];
      mockRoleService.findAll.mockResolvedValue(roles);

      const result = await controller.findAll();

      expect(mockRoleService.findAll).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const roleId = '1';
      mockRoleService.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne(roleId);

      expect(mockRoleService.findOne).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(mockRole);
    });

    it('should return null when role is not found', async () => {
      const roleId = '999';
      mockRoleService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(roleId);

      expect(mockRoleService.findOne).toHaveBeenCalledWith(roleId);
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return a role by name', async () => {
      const roleName = 'Admin';
      mockRoleService.findByName.mockResolvedValue(mockRole);

      const result = await controller.findByName(roleName);

      expect(mockRoleService.findByName).toHaveBeenCalledWith(roleName);
      expect(result).toEqual(mockRole);
    });

    it('should return null when role name is not found', async () => {
      const roleName = 'NonExistentRole';
      mockRoleService.findByName.mockResolvedValue(null);

      const result = await controller.findByName(roleName);

      expect(mockRoleService.findByName).toHaveBeenCalledWith(roleName);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const roleId = '1';
      const updateData: Partial<Role> = {
        name: 'Super Admin',
        description: 'Updated description',
      };

      const updatedRole = { ...mockRole, ...updateData };
      mockRoleService.update.mockResolvedValue(updatedRole);

      const result = await controller.update(roleId, updateData);

      expect(mockRoleService.update).toHaveBeenCalledWith(roleId, updateData);
      expect(result).toEqual(updatedRole);
    });

    it('should handle partial updates', async () => {
      const roleId = '1';
      const updateData: Partial<Role> = {
        name: 'Super Admin',
      };

      const updatedRole = { ...mockRole, ...updateData };
      mockRoleService.update.mockResolvedValue(updatedRole);

      const result = await controller.update(roleId, updateData);

      expect(mockRoleService.update).toHaveBeenCalledWith(roleId, updateData);
      expect(result).toEqual(updatedRole);
    });

    it('should return null when role to update is not found', async () => {
      const roleId = '999';
      const updateData: Partial<Role> = {
        name: 'Super Admin',
      };

      mockRoleService.update.mockResolvedValue(null);

      const result = await controller.update(roleId, updateData);

      expect(mockRoleService.update).toHaveBeenCalledWith(roleId, updateData);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a role and return true', async () => {
      const roleId = '1';
      mockRoleService.delete.mockResolvedValue(true);

      const result = await controller.delete(roleId);

      expect(mockRoleService.delete).toHaveBeenCalledWith(roleId);
      expect(result).toBe(true);
    });

    it('should return false when role to delete is not found', async () => {
      const roleId = '999';
      mockRoleService.delete.mockResolvedValue(false);

      const result = await controller.delete(roleId);

      expect(mockRoleService.delete).toHaveBeenCalledWith(roleId);
      expect(result).toBe(false);
    });
  });
});
