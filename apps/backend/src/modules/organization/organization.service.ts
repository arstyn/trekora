import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from 'src/database/entity/organization.entity';
import { User } from 'src/database/entity/user.entity';
import { Repository } from 'typeorm';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { seedDefaultTemplates } from './seed-templates.helper';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @Inject(forwardRef(() => ActivityLogService))
    private readonly activityLogService: ActivityLogService,
    private readonly uploadService: UploadService,
  ) { }

  // Create a new organization
  async create(organizationData: Partial<Organization>): Promise<Organization> {
    const newUser = this.organizationRepository.create(organizationData);
    const org = await this.organizationRepository.save(newUser);

    try {
      // Find the first user in the database to associate as the creator
      const anyUser = await this.organizationRepository.manager.findOne(User, { where: {} });
      if (anyUser) {
        await seedDefaultTemplates(this.organizationRepository.manager, org.id, anyUser.id);
      }
    } catch (err) {
      console.error('Failed to seed default templates for new organization in OrganizationService:', err);
    }

    return org;
  }

  // Find all organizations
  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find();
  }

  // Find a organization by ID
  async findOne(id: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({ where: { id } });
  }
  // Find a organization by ID
  async findOneByName(name: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({ where: { name } });
  }

  // Update a organization by ID
  async update(
    id: string,
    updateData: any,
    userId?: string,
    sealFile?: Express.Multer.File,
  ): Promise<Organization | null> {
    const existingOrg = await this.findOne(id);
    const previousDays = existingOrg?.defaultBlockDays ?? 3;

    const payload: Partial<Organization> = { ...updateData };

    if (sealFile) {
      const sealUrl = await this.uploadService.uploadSingle(sealFile, 'organization-seals');
      payload.invoiceSeal = sealUrl;
    }

    if (payload.invoiceFields && typeof payload.invoiceFields === 'string') {
      try {
        payload.invoiceFields = JSON.parse(payload.invoiceFields);
      } catch (err) {
        console.error('Failed to parse invoiceFields JSON:', err);
      }
    }

    // Clean up temporary form file fields
    delete (payload as any).seal;

    await this.organizationRepository.update(id, payload);
    const updatedOrg = await this.findOne(id);

    if (
      userId &&
      updateData.defaultBlockDays !== undefined &&
      previousDays !== updateData.defaultBlockDays
    ) {
      try {
        await this.activityLogService.log(
          id,
          userId,
          'block_slots_default_updated',
          `Updated default block duration from ${previousDays} ${previousDays === 1 ? 'day' : 'days'} to ${updateData.defaultBlockDays} ${updateData.defaultBlockDays === 1 ? 'day' : 'days'}`,
          {
            previousValue: previousDays,
            newValue: updateData.defaultBlockDays,
          },
        );
      } catch (err) {
        console.error('Failed to log block slots default update:', err);
      }
    }

    return updatedOrg;
  }

  // Fetch block slot audit logs for an organization
  async getBlockSlotLogs(organizationId: string) {
    return await this.activityLogService.findByAction(
      organizationId,
      'block_slots_default_updated',
    );
  }

  // Delete a organization by ID
  async remove(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }
}
