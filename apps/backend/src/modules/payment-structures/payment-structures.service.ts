import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStructureTemplate } from 'src/database/entity/payment-structure-template.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { CreatePaymentStructureDto } from 'src/dto/create-payment-structure.dto';
import { UpdatePaymentStructureDto } from 'src/dto/update-payment-structure.dto';

@Injectable()
export class PaymentStructuresService {
  constructor(
    @InjectRepository(PaymentStructureTemplate)
    private readonly paymentStructureRepository: Repository<PaymentStructureTemplate>,
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

  async create(data: CreatePaymentStructureDto & { createdById: string; organizationId: string }): Promise<PaymentStructureTemplate> {
    const milestonesWithOrder = data.milestones.map((m, idx) => ({
      name: m.name,
      amount: m.amount,
      description: m.description,
      dueDate: m.dueDate,
      order: m.order ?? (idx + 1),
    }));

    const template = this.paymentStructureRepository.create({
      ...data,
      milestones: milestonesWithOrder,
    });
    return this.paymentStructureRepository.save(template);
  }

  async findAll(organizationId: string): Promise<PaymentStructureTemplate[]> {
    return this.paymentStructureRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
  }

  async findOne(id: string, organizationId: string): Promise<PaymentStructureTemplate> {
    const template = await this.paymentStructureRepository.findOne({
      where: { id, organizationId },
      relations: ['createdBy'],
    });

    if (!template) {
      throw new NotFoundException('Payment structure template not found');
    }

    return template;
  }

  async update(
    id: string,
    organizationId: string,
    updateData: UpdatePaymentStructureDto,
  ): Promise<PaymentStructureTemplate> {
    const template = await this.findOne(id, organizationId);
    
    if (updateData.name !== undefined) template.name = updateData.name;
    if (updateData.milestones !== undefined) {
      template.milestones = updateData.milestones.map((m, idx) => ({
        name: m.name,
        amount: m.amount,
        description: m.description,
        dueDate: m.dueDate,
        order: m.order ?? (idx + 1),
      }));
    }

    return this.paymentStructureRepository.save(template);
  }

  async remove(id: string, organizationId: string): Promise<PaymentStructureTemplate> {
    const template = await this.findOne(id, organizationId);
    await this.paymentStructureRepository.remove(template);
    return template;
  }
}
