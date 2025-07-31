// src/dto/update-user-notification.dto.ts
import { IsObject } from 'class-validator';

export class UpdateUserNotificationDto {
  @IsObject()
  preferences: Record<string, boolean>;
}
