import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { Customer } from '../../database/entity/customer.entity';
import { CreateCustomerDto } from '../../dto/create-customer.dto';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { EmployeeService } from '../employee/employee.service';
import { CustomerService } from './customer.service';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly employeeService: EmployeeService,
  ) { }

  //Creating Customers
  @Post()
  @RequirePermission('customer', 'create')
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
  @RequirePermission('customer', 'read')
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

  @Get('team')
  @RequirePermission('employee', 'read')
  async findTeamCustomers(
    @Request() req: ApiRequestJWT,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('search') search?: string,
  ): Promise<{
    customers: Customer[];
    hasMore: boolean;
    total: number;
  }> {
    const employee = await this.employeeService.findProfile(req.user.userId);
    if (!employee || !employee.id) {
      return { customers: [], total: 0, hasMore: false };
    }

    const directReports = await this.employeeService.getDirectReports(
      employee.id,
    );
    const teamUserIds = directReports
      .map((emp) => emp.userId)
      .filter((id): id is string => !!id);

    if (teamUserIds.length === 0) {
      return { customers: [], total: 0, hasMore: false };
    }

    return this.customerService.findByManagerTeam(
      req.user.organizationId,
      teamUserIds,
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
  @RequirePermission('customer', 'update')
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
  @RequirePermission('customer', 'delete')
  async delete(@Param('id') id: string): Promise<void> {
    return this.customerService.delete(id);
  }
}
