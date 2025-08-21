import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from '../../database/entity/batch.entity';
import { BookingPayment } from '../../database/entity/booking-payment.entity';
import { Booking } from '../../database/entity/booking.entity';
import { Customer } from '../../database/entity/customer.entity';
import { Lead } from '../../database/entity/lead.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Lead, Customer, BookingPayment, Batch]),
    JwtModule.register({}),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
