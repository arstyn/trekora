import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { Reminder } from './entity/reminder.entity';

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
    });

    for (const reminder of dueReminders) {
      if (!reminder.createdById) continue;
      // Use public method to get last notification
      const existing =
        await this.notificationService.getLastNotificationForReminder(
          reminder.createdById,
          reminder.id,
        );
      if (reminder.repeat && reminder.repeat !== 'none') {
        // For repeating reminders, allow if no notification or last notification is before this remindAt
        if (!existing || existing.createdAt < reminder.remindAt) {
          await this.notificationService.create(
            reminder.createdById,
            `Reminder: ${reminder.note || reminder.type}`,
            reminder.id,
          );
        }
      } else {
        // For non-repeating, only create if not already notified
        if (!existing) {
          await this.notificationService.create(
            reminder.createdById,
            `Reminder: ${reminder.note || reminder.type}`,
            reminder.id,
          );
        }
      }
      // TODO: Send email notification here
      // TODO: Mark reminder as processed or handle repeat logic
    }
  }

  @Cron('*/1 * * * *') // every minute
  async handleCron() {
    await this.processDueReminders();
  }
}
