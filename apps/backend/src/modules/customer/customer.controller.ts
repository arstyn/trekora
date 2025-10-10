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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from '../../dto/create-customer.dto';
import { Customer } from '../../database/entity/customer.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';

@UseGuards(AuthGuard)
@Controller('api/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  //Creating Customers
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'passportPhotos', maxCount: 10 },
      { name: 'voterIdPhotos', maxCount: 10 },
      { name: 'aadhaarIdPhotos', maxCount: 10 },
    ]),
  )
  async create(
    @Body() data: CreateCustomerDto,
    @Request() req: ApiRequestJWT,
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      passportPhotos?: Express.Multer.File[];
      voterIdPhotos?: Express.Multer.File[];
      aadhaarIdPhotos?: Express.Multer.File[];
    },
  ): Promise<Customer> {
    // Flatten all files into a single array for the service
    const allFiles: Express.Multer.File[] = [];
    if (files.profilePhoto) allFiles.push(...files.profilePhoto);
    if (files.passportPhotos) allFiles.push(...files.passportPhotos);
    if (files.voterIdPhotos) allFiles.push(...files.voterIdPhotos);
    if (files.aadhaarIdPhotos) allFiles.push(...files.aadhaarIdPhotos);

    return this.customerService.createCustomer(
      data,
      req.user.userId,
      req.user.organizationId,
      allFiles,
    );
  }

  //Getting all data
  @Get()
  async findAll(
    @Request() req: ApiRequestJWT,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('search') search?: string,
  ): Promise<{
    customers: Customer[];
    total: number;
    hasMore: boolean;
  }> {
    return this.customerService.findAll(
      req.user.organizationId,
      limit,
      offset,
      search,
    );
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Request() req: ApiRequestJWT,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{
    customers: Customer[];
    total: number;
    hasMore: boolean;
  }> {
    return this.customerService.search(
      query || '',
      req.user.organizationId,
      limit,
      offset,
    );
  }

  //Getting Single Data
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer | null> {
    return this.customerService.findOneWithFiles(id);
  }
  //Updating data
  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'passportPhotos', maxCount: 10 },
      { name: 'voterIdPhotos', maxCount: 10 },
      { name: 'aadhaarIdPhotos', maxCount: 10 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updatedData: Partial<CreateCustomerDto>,
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      passportPhotos?: Express.Multer.File[];
      voterIdPhotos?: Express.Multer.File[];
      aadhaarIdPhotos?: Express.Multer.File[];
    },
  ): Promise<Customer | null> {
    // Flatten all files into a single array for the service
    const allFiles: Express.Multer.File[] = [];
    if (files?.profilePhoto) allFiles.push(...files.profilePhoto);
    if (files?.passportPhotos) allFiles.push(...files.passportPhotos);
    if (files?.voterIdPhotos) allFiles.push(...files.voterIdPhotos);
    if (files?.aadhaarIdPhotos) allFiles.push(...files.aadhaarIdPhotos);

    return this.customerService.update(id, updatedData, allFiles);
  }
  //Delete Customer
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.customerService.delete(id);
  }
}
