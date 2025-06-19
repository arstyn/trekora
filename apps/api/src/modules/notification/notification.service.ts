import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entity/notification.entity';
import { User } from '../user/entity/user.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(user: User, message: string): Promise<Notification> {
    const notification = this.notificationRepository.create({ user, message });
    const saved = await this.notificationRepository.save(notification);
    // Emit real-time notification
    if (user && user.id) {
      this.notificationGateway.sendNotificationToUser(user.id, saved);
    }
    return saved;
  }

  async findByUserId(userId: number): Promise<Notification[]> {
    return this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoin('notification.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationRepository.update(id, { isRead: true });
  }

  async remove(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }
}
