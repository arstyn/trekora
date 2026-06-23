import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meals } from 'src/database/entity/meals.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { IMealCreateDTO } from 'src/dto/create-meal.dto';
import { IMealUpdateDTO } from 'src/dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meals)
    private readonly mealsRepository: Repository<Meals>,
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

  async create(data: IMealCreateDTO & { createdById: string; organizationId: string }): Promise<Meals> {
    const meal = this.mealsRepository.create(data);
    return this.mealsRepository.save(meal);
  }

  async findAll(organizationId: string): Promise<Meals[]> {
    return this.mealsRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
  }

  async findOne(id: string, organizationId: string): Promise<Meals> {
    const meal = await this.mealsRepository.findOne({
      where: { id, organizationId },
      relations: ['createdBy'],
    });

    if (!meal) {
      throw new NotFoundException('Meal option not found');
    }

    return meal;
  }

  async update(id: string, organizationId: string, updateData: IMealUpdateDTO): Promise<Meals> {
    const meal = await this.findOne(id, organizationId);
    
    if (updateData.name !== undefined) meal.name = updateData.name;
    if (updateData.breakfast !== undefined) meal.breakfast = updateData.breakfast;
    if (updateData.lunch !== undefined) meal.lunch = updateData.lunch;
    if (updateData.dinner !== undefined) meal.dinner = updateData.dinner;

    return this.mealsRepository.save(meal);
  }

  async remove(id: string, organizationId: string): Promise<Meals> {
    const meal = await this.findOne(id, organizationId);
    await this.mealsRepository.remove(meal);
    return meal;
  }
}
