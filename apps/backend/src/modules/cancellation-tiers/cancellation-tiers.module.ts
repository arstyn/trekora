import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CancellationTierTemplate } from 'src/database/entity/cancellation-tier-template.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { CancellationTiersController } from './cancellation-tiers.controller';
import { CancellationTiersService } from './cancellation-tiers.service';

@Module({
  controllers: [CancellationTiersController],
  providers: [CancellationTiersService],
  imports: [
    TypeOrmModule.forFeature([CancellationTierTemplate, Employee]),
    JwtModule.register({}),
  ],
  exports: [CancellationTiersService],
})
export class CancellationTiersModule {}
