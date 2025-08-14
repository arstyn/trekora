import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  UseGuards,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from '../../dto/create-customer';
import { Customer } from '../../database/entity/customer.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';

@UseGuards(AuthGuard)
@Controller('api/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  //Creating Customers
  @Post()
  async create(
    @Body() data: CreateCustomerDto,
    @Request() req: ApiRequestJWT,
  ): Promise<Customer> {
    return this.customerService.createCustomer(
      data,
      req.user.userId,
      req.user.organizationId,
    );
  }

  //Getting all data
  @Get()
  async findAll(@Request() req: ApiRequestJWT): Promise<Customer[]> {
    return this.customerService.findAll(req.user.organizationId);
  }

  @Get('search')
  async search(@Query('q') query: string): Promise<Customer[]> {
    return this.customerService.search(query || '');
  }

  //Getting Single Data
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer | null> {
    return this.customerService.findOne(id); // +id converts string to number
  }
  //Updating data
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatedData: Partial<Customer>,
  ): Promise<Customer | null> {
    return this.customerService.update(id, updatedData);
  }
  //Delete Customer
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.customerService.delete(id);
  }
}
