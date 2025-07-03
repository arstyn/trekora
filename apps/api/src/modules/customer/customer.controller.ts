import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  UseGuards,
  Param,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer';
import { Customer } from '../../database/entity/customer.entity';
import { AuthGuard } from '../auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('api/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  //Creating Customers
  @Post()
  async create(@Body() data: CreateCustomerDto): Promise<Customer> {
    return this.customerService.createCustomer(data);
  }

  //Geting all data
  @Get()
  async findAll(): Promise<Customer[]> {
    return this.customerService.findAll();
  }

  //Getting Single Data
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer | null> {
    return this.customerService.findOne(+id); // +id converts string to number
  }
  //Updating data
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updatedData: Partial<Customer>,
  ): Promise<Customer> {
    return this.customerService.update(id, updatedData);
  }
  //Delete Customer
  @Delete('id')
  async delet(@Param('id') id: number): Promise<void> {
    return this.customerService.delete(id);
  }
  /*Basic Crud operation Till here*/
}
