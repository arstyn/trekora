import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from 'src/database/entity/batch.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch, Employee]),
    JwtModule.register({}),
  ],
  controllers: [BatchesController],
  providers: [BatchesService],
})
export class BatchesModule {}
