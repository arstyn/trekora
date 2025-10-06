import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/database/entity/booking.entity';
import { BookingPayment } from 'src/database/entity/booking-payment.entity';
// Remove BookingPassenger import as we're using customers directly
import { BookingDocument } from 'src/database/entity/booking-document.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Package } from 'src/database/entity/package-related/package.entity';
import { Batch } from 'src/database/entity/batch.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { JwtModule } from '@nestjs/jwt';
import { BookingChecklist } from 'src/database/entity/booking-checklist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingPayment,
      BookingDocument,
      BookingChecklist,
      Customer,
      Package,
      Batch,
    ]),
    JwtModule.register({}),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
