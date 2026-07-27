import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CancellationTierTemplate } from 'src/database/entity/cancellation-tier-template.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { CreateCancellationTierTemplateDto } from 'src/dto/create-cancellation-tier-template.dto';
import { UpdateCancellationTierTemplateDto } from 'src/dto/update-cancellation-tier-template.dto';

@Injectable()
export class CancellationTiersService {
  constructor(
    @InjectRepository(CancellationTierTemplate)
    private readonly cancellationTierRepository: Repository<CancellationTierTemplate>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async isAdminOrManager(userId: string, organizationId: string): Promise<boolean> {
    const employee = await this.employeeRepository.findOne({
      where: { userId, organizationId },
      relations: ['profilePermissionSets', 'profilePermissionSets.permissionSet'],
    });

    if (!employee) {
      return false;
    }

    return employee.profilePermissionSets.some(
      (pps) =>
        pps.permissionSet?.name === 'Admin - Full Access' ||
        pps.permissionSet?.name === 'General Manager',
    );
  }

  async create(data: CreateCancellationTierTemplateDto & { createdById: string; organizationId: string }): Promise<CancellationTierTemplate> {
    const template = this.cancellationTierRepository.create(data);
    return this.cancellationTierRepository.save(template);
  }

  async findAll(organizationId: string): Promise<CancellationTierTemplate[]> {
    return this.cancellationTierRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
  }

  async findOne(id: string, organizationId: string): Promise<CancellationTierTemplate> {
    const template = await this.cancellationTierRepository.findOne({
      where: { id, organizationId },
      relations: ['createdBy'],
    });

    if (!template) {
      throw new NotFoundException('Cancellation tier template not found');
    }

    return template;
  }

  async update(
    id: string,
    organizationId: string,
    updateData: UpdateCancellationTierTemplateDto,
  ): Promise<CancellationTierTemplate> {
    const template = await this.findOne(id, organizationId);
    
    if (updateData.name !== undefined) template.name = updateData.name;
    if (updateData.tiers !== undefined) template.tiers = updateData.tiers;

    return this.cancellationTierRepository.save(template);
  }

  async remove(id: string, organizationId: string): Promise<CancellationTierTemplate> {
    const template = await this.findOne(id, organizationId);
    await this.cancellationTierRepository.remove(template);
    return template;
  }
}
