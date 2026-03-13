import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { BookingPayment } from 'src/database/entity/booking-payment.entity';
import { Booking } from 'src/database/entity/booking.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Package } from 'src/database/entity/package-related/package.entity';
import { Batch } from 'src/database/entity/batch.entity';
import { FileManager } from 'src/database/entity/file-manager.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { FileManagerService } from '../file-manager/file-manager.service';
import { PermissionModule } from '../permission/permission.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingPayment,
      Booking,
      Customer,
      Package,
      Batch,
      FileManager,
    ]),
    JwtModule.register({}),
    PermissionModule,
    EmployeeModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, FileManagerService],
  exports: [PaymentService],
})
export class PaymentModule { } 