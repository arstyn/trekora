import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadUpdatesService } from './lead-updates.service';
import { LeadUpdatesController } from './lead-updates.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { LeadUpdate } from 'src/database/entity/lead-update.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeadUpdate]),
    JwtModule.register({}),
    UserModule,
  ],
  controllers: [LeadUpdatesController],
  providers: [LeadUpdatesService],
  exports: [LeadUpdatesService],
})
export class LeadUpdatesModule {}
