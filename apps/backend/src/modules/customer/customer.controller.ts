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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FilesInterceptor('files', 20))
  async create(
    @Body() data: CreateCustomerDto,
    @Request() req: ApiRequestJWT,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Customer> {
    return this.customerService.createCustomer(
      data,
      req.user.userId,
      req.user.organizationId,
      files || [],
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
    return this.customerService.findOneWithFiles(id);
  }
  //Updating data
  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 20))
  async update(
    @Param('id') id: string,
    @Body() updatedData: Partial<CreateCustomerDto>,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Customer | null> {
    return this.customerService.update(id, updatedData, files || []);
  }
  //Delete Customer
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.customerService.delete(id);
  }
}
