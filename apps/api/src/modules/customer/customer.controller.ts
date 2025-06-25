import { Body, Controller, Post } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer';
import { Customer } from './entity/customer.entity';


@Controller('api/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Body() data: CreateCustomerDto): Promise<Customer> {
    return this.customerService.createCustomer(data);
  }
}