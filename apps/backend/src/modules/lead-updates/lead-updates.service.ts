import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeadUpdate } from 'src/database/entity/lead-update.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { CreateLeadUpdateDto } from './dto/create-lead-update.dto';
import { UpdateLeadUpdateDto } from './dto/update-lead-update.dto';

@Injectable()
export class LeadUpdatesService {
  constructor(
    @InjectRepository(LeadUpdate)
    private leadUpdatesRepository: Repository<LeadUpdate>,
    private userService: UserService,
  ) {}

  async create(createLeadUpdateDto: CreateLeadUpdateDto, createdById: string) {
    const user = await this.userService.findOne(createdById);

    if (!user) {
      throw new Error('User not found');
    }

    const leadUpdate = this.leadUpdatesRepository.create({
      ...createLeadUpdateDto,
      createdById,
    });

    const leadUpdated = await this.leadUpdatesRepository.save(leadUpdate);

    return {
      ...leadUpdated,
      createdBy: {
        name: user.name,
      },
    };
  }

  async findAll(leadId: string) {
    const updates = await this.leadUpdatesRepository.find({
      where: { leadId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });

    return updates.map((update) => ({
      ...update,
      createdBy: { name: update.createdBy.name },
    }));
  }

  findOne(id: string) {
    return this.leadUpdatesRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  async update(id: string, updateLeadUpdateDto: UpdateLeadUpdateDto) {
    await this.leadUpdatesRepository.update(id, updateLeadUpdateDto);
    const updateOne = await this.findOne(id);

    return updateOne;
  }

  async remove(id: string) {
    const leadUpdate = await this.findOne(id);
    if (leadUpdate) {
      await this.leadUpdatesRepository.remove(leadUpdate);
    }
    return leadUpdate;
  }
}
