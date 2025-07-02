import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { JwtModule } from '@nestjs/jwt';
import { Customer } from 'src/database/entity/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), JwtModule.register({})],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
