import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { Customer } from './entity/customer.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), JwtModule.register({})],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
