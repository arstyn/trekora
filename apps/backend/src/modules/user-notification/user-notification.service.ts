import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from 'src/database/entity/user.entity';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { UserNotificationType } from 'src/database/entity/user-notification-type.entity';

@Injectable()
export class UserNotificationService {
  constructor(
    @InjectRepository(UserNotification)
    private readonly userNotificationRepo: Repository<UserNotification>,

    @InjectRepository(UserNotificationType)
    private readonly typeRepo: Repository<UserNotificationType>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** Return all enabled notification rows for a user */
  async getByUserId(userId: string): Promise<UserNotification[]> {
    return this.userNotificationRepo.find({
      where: { user: { id: userId } },
      relations: { userNotificationType: true },
    });
  }

  /**
   * Up‑sert user preferences:
   *  • Adds rows for newly‑enabled types  
   *  • Deletes rows for disabled types
   */
  async updatePreferences(userId: string, enabledTypeIds: string[]): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // 1) grab existing rows
    const existing = await this.userNotificationRepo.find({
      where: { user: { id: userId } },
    });
    const existingTypeIds = existing.map((n) => n.userNotificationType.id);

    // 2) diff
    const toAddIds    = enabledTypeIds.filter((id) => !existingTypeIds.includes(id));
    const toRemoveIds = existingTypeIds.filter((id) => !enabledTypeIds.includes(id));

    // 3a) remove disabled
    if (toRemoveIds.length) {
      await this.userNotificationRepo.delete({
        user: { id: userId },
        userNotificationType: { id: In(toRemoveIds) },
      });
    }

    // 3b) add new enabled
    if (toAddIds.length) {
      const types = await this.typeRepo.find({ where: { id: In(toAddIds) } });
      const newRows = types.map((t) =>
        this.userNotificationRepo.create({ user, userNotificationType: t }),
      );
      await this.userNotificationRepo.save(newRows);
    }
  }
}
