import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { Lead } from 'src/database/entity/lead.entity';

@Module({
  controllers: [LeadController],
  providers: [LeadService],
  imports: [TypeOrmModule.forFeature([Lead]), JwtModule.register({})],
  exports: [LeadService],
})
export class LeadModule {}
