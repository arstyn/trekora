import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PermissionModule } from '../permission/permission.module';
import { MailerModule } from '../mailer/mailer.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => PermissionModule),
    forwardRef(() => ActivityLogModule),
    MailerModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
