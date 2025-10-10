import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guard/auth.guard';
import { EmployeeService } from './employee.service';
import { Employee } from 'src/database/entity/employee.entity';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { IEmployeeCreateDTO } from 'src/dto/create-employee.dto';

@UseGuards(AuthGuard)
@Controller('api/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Create a new employee
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'verificationDocument', maxCount: 1 },
    ]),
  )
  async create(
    @Request() req: ApiRequestJWT,
    @Body() employeeData: IEmployeeCreateDTO,
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      verificationDocument?: Express.Multer.File[];
    },
  ): Promise<Employee | null> {
    // Flatten all files into a single array for the service
    const allFiles: Express.Multer.File[] = [];
    if (files?.profilePhoto) allFiles.push(...files.profilePhoto);
    if (files?.verificationDocument)
      allFiles.push(...files.verificationDocument);

    return this.employeeService.create(
      {
        ...employeeData,
        organizationId: req.user.organizationId,
        userId: req.user.userId,
      },
      allFiles,
    );
  }

  // Get all employees
  @Get()
  async findAll(@Request() req: ApiRequestJWT): Promise<Employee[]> {
    return this.employeeService.findAll(req.user.organizationId);
  }

  @Get('profile')
  async findProfile(@Request() req: ApiRequestJWT): Promise<Employee | null> {
    return this.employeeService.findProfile(req.user.userId);
  }

  // Get a single employee by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Employee | null> {
    return this.employeeService.findOneWithFiles(id);
  }

  // Update an employee by ID
  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'verificationDocument', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updateData: IEmployeeCreateDTO,
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      verificationDocument?: Express.Multer.File[];
    },
  ): Promise<Employee> {
    // Flatten all files into a single array for the service
    const allFiles: Express.Multer.File[] = [];
    if (files?.profilePhoto) allFiles.push(...files.profilePhoto);
    if (files?.verificationDocument)
      allFiles.push(...files.verificationDocument);

    return this.employeeService.update(id, updateData, allFiles);
  }

  // Terminate an employee by ID
  @Patch(':id/terminate')
  async terminate(@Param('id') id: string): Promise<Employee | null> {
    return this.employeeService.terminate(id);
  }

  // Delete an employee by ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeeService.remove(id);
  }

  // Activate an employee by ID
  @Post(':id/activateUser')
  async activateUser(@Param('id') id: string) {
    return this.employeeService.activateUser(id);
  }
}
