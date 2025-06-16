import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { Organization } from './entity/organization.entity';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let organizationService: OrganizationService;

  const mockOrganizationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockOrganization: Partial<Organization> = {
    id: '1',
    name: 'Test Organization',
    domain: 'test.com',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
    organizationService = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new organization', async () => {
      const organizationData: Partial<Organization> = {
        name: 'Test Organization',
        domain: 'test.com',
      };

      mockOrganizationService.create.mockResolvedValue(mockOrganization);

      const result = await controller.create(organizationData);

      expect(mockOrganizationService.create).toHaveBeenCalledWith(
        organizationData,
      );
      expect(result).toEqual(mockOrganization);
    });

    it('should create an organization with minimal data', async () => {
      const organizationData: Partial<Organization> = {
        name: 'Test Organization',
      };

      const minimalOrg = { ...mockOrganization, domain: undefined };
      mockOrganizationService.create.mockResolvedValue(minimalOrg);

      const result = await controller.create(organizationData);

      expect(mockOrganizationService.create).toHaveBeenCalledWith(
        organizationData,
      );
      expect(result).toEqual(minimalOrg);
    });
  });

  describe('findAll', () => {
    it('should return an array of organizations', async () => {
      const organizations = [mockOrganization];
      mockOrganizationService.findAll.mockResolvedValue(organizations);

      const result = await controller.findAll();

      expect(mockOrganizationService.findAll).toHaveBeenCalled();
      expect(result).toEqual(organizations);
    });
  });

  describe('findOne', () => {
    it('should return an organization by id', async () => {
      const organizationId = '1';
      mockOrganizationService.findOne.mockResolvedValue(mockOrganization);

      const result = await controller.findOne(organizationId);

      expect(mockOrganizationService.findOne).toHaveBeenCalledWith(
        organizationId,
      );
      expect(result).toEqual(mockOrganization);
    });

    it('should return null when organization is not found', async () => {
      const organizationId = '999';
      mockOrganizationService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(organizationId);

      expect(mockOrganizationService.findOne).toHaveBeenCalledWith(
        organizationId,
      );
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an organization', async () => {
      const organizationId = '1';
      const updateData: Partial<Organization> = {
        name: 'Updated Organization',
        domain: 'updated.com',
      };

      const updatedOrganization = { ...mockOrganization, ...updateData };
      mockOrganizationService.update.mockResolvedValue(updatedOrganization);

      const result = await controller.update(organizationId, updateData);

      expect(mockOrganizationService.update).toHaveBeenCalledWith(
        organizationId,
        updateData,
      );
      expect(result).toEqual(updatedOrganization);
    });

    it('should return null when organization to update is not found', async () => {
      const organizationId = '999';
      const updateData: Partial<Organization> = {
        name: 'Updated Organization',
      };

      mockOrganizationService.update.mockResolvedValue(null);

      const result = await controller.update(organizationId, updateData);

      expect(mockOrganizationService.update).toHaveBeenCalledWith(
        organizationId,
        updateData,
      );
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete an organization', async () => {
      const organizationId = '1';
      mockOrganizationService.remove.mockResolvedValue(undefined);

      await controller.remove(organizationId);

      expect(mockOrganizationService.remove).toHaveBeenCalledWith(
        organizationId,
      );
    });
  });
});
