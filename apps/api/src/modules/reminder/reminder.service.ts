import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './entity/reminder.entity';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
  ) {}

  async create(data: Partial<Reminder>): Promise<Reminder> {
    const reminder = this.reminderRepository.create(data);
    return this.reminderRepository.save(reminder);
  }

  async findAll(): Promise<Reminder[]> {
    return this.reminderRepository.find();
  }

  async findOne(id: string): Promise<Reminder | null> {
    return this.reminderRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Reminder>): Promise<Reminder | null> {
    await this.reminderRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.reminderRepository.delete(id);
  }
}
