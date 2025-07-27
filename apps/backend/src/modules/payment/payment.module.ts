import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { BookingPayment } from 'src/database/entity/booking-payment.entity';
import { Booking } from 'src/database/entity/booking.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Package } from 'src/database/entity/package-related/package.entity';
import { Batch } from 'src/database/entity/batch.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingPayment,
      Booking,
      Customer,
      Package,
      Batch,
    ]),
    JwtModule.register({}),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {} 