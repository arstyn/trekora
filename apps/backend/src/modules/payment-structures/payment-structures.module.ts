import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PaymentStructureTemplate } from 'src/database/entity/payment-structure-template.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { PaymentStructuresController } from './payment-structures.controller';
import { PaymentStructuresService } from './payment-structures.service';

@Module({
  controllers: [PaymentStructuresController],
  providers: [PaymentStructuresService],
  imports: [
    TypeOrmModule.forFeature([PaymentStructureTemplate, Employee]),
    JwtModule.register({}),
  ],
  exports: [PaymentStructuresService],
})
export class PaymentStructuresModule {}
