import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entity/notification.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(
    userId: string,
    message: string,
    reminderId?: string,
  ): Promise<Notification> {
    // Prevent duplicate for non-repeating reminders
    if (reminderId) {
      const existing = await this.notificationRepository.findOne({
        where: { userId, reminderId },
      });
      if (existing) return existing;
    }
    const notification = this.notificationRepository.create({
      userId: userId,
      message,
      reminderId,
    });
    const saved = await this.notificationRepository.save(notification);
    // Emit real-time notification
    if (userId) {
      this.notificationGateway.sendNotificationToUser(userId, saved);
    }
    return saved;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'desc',
      },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationRepository.update(id, { isRead: true });
  }

  async remove(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async getLastNotificationForReminder(
    userId: string,
    reminderId: string,
  ): Promise<Notification | undefined> {
    return this.notificationRepository.findOne({
      where: { userId, reminderId },
      order: { createdAt: 'DESC' },
    });
  }
}
