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

  async getByUserId(userId: string): Promise<Record<string, boolean>> {
    const allTypes = await this.typeRepo.find();
    const active = await this.userNotificationRepo.find({
      where: { user: { id: userId } },
      relations: ['userNotificationType'],
    });

    const activeTypeTitles = new Set(
      active.map((n) => n.userNotificationType.title),
    );

    const result: Record<string, boolean> = {};
    for (const type of allTypes) {
      result[type.title] = activeTypeTitles.has(type.title);
    }

    return result;
  }

  async updatePreferences(
    userId: string,
    input: Record<string, boolean>,
  ): Promise<Record<string, boolean>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const allTypes = await this.typeRepo.find();
    const typeMap = new Map(allTypes.map((t) => [t.title, t]));

    const existing = await this.userNotificationRepo.find({
      where: { user: { id: userId } },
      relations: ['userNotificationType'],
    });

    const existingTitles = new Set(
      existing.map((n) => n.userNotificationType.title),
    );

    const toAdd = Object.entries(input)
      .filter(([title, enabled]) => enabled && !existingTitles.has(title))
      .map(([title]) => typeMap.get(title))
      .filter(Boolean) as UserNotificationType[];

    const toRemove = existing.filter(
      (n) => input[n.userNotificationType.title] === false,
    );

    if (toRemove.length) {
      await this.userNotificationRepo.remove(toRemove);
    }

    if (toAdd.length) {
      const newEntities = toAdd.map((type) =>
        this.userNotificationRepo.create({ user, userNotificationType: type }),
      );
      await this.userNotificationRepo.save(newEntities);
    }

    return this.getByUserId(userId);
  }
}
