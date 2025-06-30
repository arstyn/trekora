import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entity/group.entity';
import { CreateGroupDto } from './dto/create-group';
import { UpdateGroupDto } from './dto/update-group';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  create(data: CreateGroupDto): Promise<Group> {
    const group = this.groupRepository.create(data);
    return this.groupRepository.save(group);
  }

  findAll(): Promise<Group[]> {
    return this.groupRepository.find();
  }

  findOne(id: number): Promise<Group | null> {
    return this.groupRepository.findOneBy({ id });
  }

  async update(id: number, data: UpdateGroupDto): Promise<Group> {
    await this.groupRepository.update(id, data);
    return this.groupRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.groupRepository.delete(id);
  }
}
