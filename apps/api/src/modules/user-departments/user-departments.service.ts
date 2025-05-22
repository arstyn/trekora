import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { UserDepartments } from './entity/user-departments.entity';

@Injectable()
export class UserDepartmentsService {
  constructor(
    @InjectRepository(UserDepartments)
    private readonly userDepartmentsRepository: Repository<UserDepartments>,
  ) {}

  async create(data: Partial<UserDepartments>, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(UserDepartments)
      : this.userDepartmentsRepository;

    const department = repository.create(data);
    return repository.save(department);
  }

  async findAll(): Promise<UserDepartments[]> {
    return this.userDepartmentsRepository.find();
  }

  async findByIds(ids: string[]) {
    return this.userDepartmentsRepository.find({ where: { id: In(ids) } });
  }

  async findOne(id: string): Promise<UserDepartments | null> {
    return this.userDepartmentsRepository.findOneBy({ id });
  }

  async update(
    id: string,
    data: Partial<UserDepartments>,
  ): Promise<UserDepartments | null> {
    await this.userDepartmentsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userDepartmentsRepository.delete(id);
  }

  async removeByEmployeeId(
    employeeId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(UserDepartments)
      : this.userDepartmentsRepository;

    await repository.delete({ employeeId });
  }
}
