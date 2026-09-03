import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Batch } from 'src/database/entity/batch.entity';
import { BatchOffer } from 'src/database/entity/batch-offer.entity';
import { PermissionModule } from '../permission/permission.module';
import { BatchOffersController } from './batch-offers.controller';
import { BatchOffersService } from './batch-offers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BatchOffer, Batch]),
    JwtModule.register({}),
    forwardRef(() => PermissionModule),
  ],
  controllers: [BatchOffersController],
  providers: [BatchOffersService],
  exports: [BatchOffersService],
})
export class BatchOffersModule {}
