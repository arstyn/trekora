import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Reminder } from './entity/reminder.entity';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/entity/user.entity';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    data: Partial<Reminder>,
    user: { userId: string; organizationId: string },
  ): Promise<Reminder> {
    const reminder = this.reminderRepository.create({
      ...data,
      createdById: user.userId,
      organizationId: user.organizationId,
    });
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

  // Process due reminders, create notifications, and send emails
  async processDueReminders(): Promise<void> {
    const now = new Date();
    const dueReminders = await this.reminderRepository.find({
      where: { remindAt: LessThanOrEqual(now) },
      relations: ['createdBy'],
    });
    for (const reminder of dueReminders) {
      if (reminder.createdBy) {
        // Create in-app notification
        await this.notificationService.create(
          reminder.createdBy as User,
          `Reminder: ${reminder.note || reminder.type}`,
        );
        // TODO: Send email notification here
      }
      // TODO: Mark reminder as processed or handle repeat logic
    }
  }
}
