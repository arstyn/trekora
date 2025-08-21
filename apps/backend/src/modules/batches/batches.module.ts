import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from 'src/database/entity/batch.entity';
import { BookingPassenger } from 'src/database/entity/booking-passenger.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch, Employee, BookingPassenger]),
    JwtModule.register({}),
  ],
  controllers: [BatchesController],
  providers: [BatchesService],
})
export class BatchesModule {}

