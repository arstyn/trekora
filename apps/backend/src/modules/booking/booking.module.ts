import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/database/entity/booking.entity';
import { BookingPayment } from 'src/database/entity/booking-payment.entity';
import { BookingPassenger } from 'src/database/entity/booking-passenger.entity';
import { BookingDocument } from 'src/database/entity/booking-document.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Package } from 'src/database/entity/package-related/package.entity';
import { Batch } from 'src/database/entity/batch.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingPayment,
      BookingPassenger,
      BookingDocument,
      Customer,
      Package,
      Batch,
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {} 