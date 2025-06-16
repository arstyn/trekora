import { Test, TestingModule } from '@nestjs/testing';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { Branch } from './entity/branch.entity';
import { IBranchCreateDTO } from '@repo/api/branch/dto/create-branch.dto';
import { IBranchUpdateDTO } from '@repo/api/branch/dto/update-branch.dto';
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';

describe('BranchController', () => {
  let controller: BranchController;
  let branchService: BranchService;

  const mockBranchService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockBranch: Partial<Branch> = {
    id: '1',
    name: 'Main Branch',
    location: 'New York',
    organizationId: 'org1',
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
      controllers: [BranchController],
      providers: [
        {
          provide: BranchService,
          useValue: mockBranchService,
        },
      ],
    }).compile();

    controller = module.get<BranchController>(BranchController);
    branchService = module.get<BranchService>(BranchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new branch', async () => {
      const branchData: IBranchCreateDTO = {
        name: 'Main Branch',
        location: 'New York',
      };

      mockBranchService.create.mockResolvedValue(mockBranch);

      const result = await controller.create(mockRequest, branchData);

      expect(mockBranchService.create).toHaveBeenCalledWith({
        ...branchData,
        organizationId: mockRequest.user.organizationId,
      });
      expect(result).toEqual(mockBranch);
    });

    it('should create a branch with all fields', async () => {
      const branchData: IBranchCreateDTO = {
        name: 'Main Branch',
        location: 'New York',
        isActive: true,
      };

      mockBranchService.create.mockResolvedValue(mockBranch);

      const result = await controller.create(mockRequest, branchData);

      expect(mockBranchService.create).toHaveBeenCalledWith({
        ...branchData,
        organizationId: mockRequest.user.organizationId,
      });
      expect(result).toEqual(mockBranch);
    });
  });

  describe('get', () => {
    it('should return an array of branches', async () => {
      const branches = [mockBranch];
      mockBranchService.findAll.mockResolvedValue(branches);

      const result = await controller.get(mockRequest);

      expect(mockBranchService.findAll).toHaveBeenCalled();
      expect(result).toEqual(branches);
    });
  });

  describe('update', () => {
    it('should update a branch', async () => {
      const branchId = '1';
      const updateData: IBranchUpdateDTO = {
        name: 'Updated Branch',
        location: 'Los Angeles',
      };

      const updatedBranch = { ...mockBranch, ...updateData };
      mockBranchService.update.mockResolvedValue(updatedBranch);

      const result = await controller.update(branchId, updateData);

      expect(mockBranchService.update).toHaveBeenCalledWith(
        branchId,
        updateData,
      );
      expect(result).toEqual(updatedBranch);
    });

    it('should handle partial updates', async () => {
      const branchId = '1';
      const updateData: IBranchUpdateDTO = {
        name: 'Updated Branch',
      };

      const updatedBranch = { ...mockBranch, ...updateData };
      mockBranchService.update.mockResolvedValue(updatedBranch);

      const result = await controller.update(branchId, updateData);

      expect(mockBranchService.update).toHaveBeenCalledWith(
        branchId,
        updateData,
      );
      expect(result).toEqual(updatedBranch);
    });

    it('should return null when branch to update is not found', async () => {
      const branchId = '999';
      const updateData: IBranchUpdateDTO = {
        name: 'Updated Branch',
      };

      mockBranchService.update.mockResolvedValue(null);

      const result = await controller.update(branchId, updateData);

      expect(mockBranchService.update).toHaveBeenCalledWith(
        branchId,
        updateData,
      );
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a branch', async () => {
      const branchId = '1';
      mockBranchService.remove.mockResolvedValue(mockBranch);

      const result = await controller.remove(branchId);

      expect(mockBranchService.remove).toHaveBeenCalledWith(branchId);
      expect(result).toEqual(mockBranch);
    });
  });
});
