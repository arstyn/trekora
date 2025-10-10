import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreBookingController } from './pre-booking.controller';
import { PreBookingService } from './pre-booking.service';
import { PreBooking } from 'src/database/entity/pre-booking.entity';
import { Lead } from 'src/database/entity/lead.entity';
import { Package } from 'src/database/entity/package-related/package.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { BookingModule } from '../booking/booking.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([PreBooking, Lead, Package, Customer]),
    BookingModule,
    JwtModule.register({}),
  ],
  controllers: [PreBookingController],
  providers: [PreBookingService],
  exports: [PreBookingService],
})
export class PreBookingModule {}
