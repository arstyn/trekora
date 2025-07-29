import { IsUUID, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class UpdateUserNotificationDto {
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  typeIds: string[];
}
