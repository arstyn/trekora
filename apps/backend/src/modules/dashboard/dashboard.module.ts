import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchOffer } from '../../database/entity/batch-offer.entity';
import { Batch } from '../../database/entity/batch.entity';
import { BookingPayment } from '../../database/entity/booking-payment.entity';
import { Booking } from '../../database/entity/booking.entity';
import { Customer } from '../../database/entity/customer.entity';
import { Lead } from '../../database/entity/lead.entity';
import { Package } from '../../database/entity/package-related/package.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Lead,
      Customer,
      BookingPayment,
      Batch,
      Package,
      BatchOffer,
    ]),
    JwtModule.register({}),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule { }
