import { Test, TestingModule } from '@nestjs/testing';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { Lead } from './entity/lead.entity';
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';

describe('LeadController', () => {
  let controller: LeadController;
  let leadService: LeadService;

  const mockLeadService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockLead: Partial<Lead> = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    company: 'Acme Inc',
    organizationId: 'org1',
    status: 'new',
  };

  const mockRequest: ApiRequestJWT = {
    user: {
      userId: 'user1',
      organizationId: 'org1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadController],
      providers: [
        {
          provide: LeadService,
          useValue: mockLeadService,
        },
      ],
    }).compile();

    controller = module.get<LeadController>(LeadController);
    leadService = module.get<LeadService>(LeadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      const leadData: Partial<Lead> = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Acme Inc',
        status: 'new',
      };

      mockLeadService.create.mockResolvedValue(mockLead);

      const result = await controller.create(mockRequest, leadData);

      expect(mockLeadService.create).toHaveBeenCalledWith(
        mockRequest.user,
        leadData,
      );
      expect(result).toEqual(mockLead);
    });

    it('should create a lead with minimal data', async () => {
      const leadData: Partial<Lead> = {
        name: 'John Doe',
        status: 'new',
      };

      const minimalLead = {
        ...mockLead,
        email: undefined,
        phone: undefined,
        company: undefined,
      };
      mockLeadService.create.mockResolvedValue(minimalLead);

      const result = await controller.create(mockRequest, leadData);

      expect(mockLeadService.create).toHaveBeenCalledWith(
        mockRequest.user,
        leadData,
      );
      expect(result).toEqual(minimalLead);
    });
  });

  describe('findAll', () => {
    it('should return an array of leads', async () => {
      const leads = [mockLead];
      mockLeadService.findAll.mockResolvedValue(leads);

      const result = await controller.findAll(mockRequest);

      expect(mockLeadService.findAll).toHaveBeenCalledWith(
        mockRequest.user.organizationId,
      );
      expect(result).toEqual(leads);
    });
  });

  describe('findOne', () => {
    it('should return a lead by id', async () => {
      const leadId = '1';
      mockLeadService.findOne.mockResolvedValue(mockLead);

      const result = await controller.findOne(leadId);

      expect(mockLeadService.findOne).toHaveBeenCalledWith(leadId);
      expect(result).toEqual(mockLead);
    });

    it('should return null when lead is not found', async () => {
      const leadId = '999';
      mockLeadService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(leadId);

      expect(mockLeadService.findOne).toHaveBeenCalledWith(leadId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a lead', async () => {
      const leadId = '1';
      const updateData: Partial<Lead> = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        status: 'contacted',
      };

      const updatedLead = { ...mockLead, ...updateData };
      mockLeadService.update.mockResolvedValue(updatedLead);

      const result = await controller.update(leadId, updateData);

      expect(mockLeadService.update).toHaveBeenCalledWith(leadId, updateData);
      expect(result).toEqual(updatedLead);
    });

    it('should handle partial updates', async () => {
      const leadId = '1';
      const updateData: Partial<Lead> = {
        status: 'qualified',
      };

      const updatedLead = { ...mockLead, ...updateData };
      mockLeadService.update.mockResolvedValue(updatedLead);

      const result = await controller.update(leadId, updateData);

      expect(mockLeadService.update).toHaveBeenCalledWith(leadId, updateData);
      expect(result).toEqual(updatedLead);
    });

    it('should return null when lead to update is not found', async () => {
      const leadId = '999';
      const updateData: Partial<Lead> = {
        status: 'qualified',
      };

      mockLeadService.update.mockResolvedValue(null);

      const result = await controller.update(leadId, updateData);

      expect(mockLeadService.update).toHaveBeenCalledWith(leadId, updateData);
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a lead', async () => {
      const leadId = '1';
      mockLeadService.remove.mockResolvedValue(undefined);

      await controller.remove(leadId);

      expect(mockLeadService.remove).toHaveBeenCalledWith(leadId);
    });
  });
});
