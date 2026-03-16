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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Employee } from 'src/database/entity/employee.entity';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { IEmployeeCreateDTO } from 'src/dto/create-employee.dto';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { EmployeeService } from './employee.service';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Create a new employee
  @Post()
  @RequirePermission('employee', 'create')
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
  @RequirePermission('employee', 'read')
  async findAll(@Request() req: ApiRequestJWT): Promise<Employee[]> {
    return this.employeeService.findAll(req.user.organizationId);
  }

  @Get('profile')
  async findProfile(@Request() req: ApiRequestJWT): Promise<Employee | null> {
    return this.employeeService.findProfile(req.user.userId);
  }

  // Get team user IDs for current manager
  @Get('my-team-user-ids')
  @RequirePermission('employee', 'read')
  async getMyTeamUserIds(@Request() req: ApiRequestJWT): Promise<string[]> {
    const employee = await this.employeeService.findProfile(req.user.userId);
    if (!employee || !employee.id) {
      return [];
    }

    const directReports = await this.employeeService.getDirectReports(
      employee.id,
    );
    // Get userIds from direct reports, filtering out null/undefined
    const teamUserIds = directReports
      .map((emp) => emp.userId)
      .filter((id): id is string => !!id);

    return teamUserIds;
  }

  // Get a single employee by ID
  @Get(':id')
  @RequirePermission('employee', 'read')
  async findOne(@Param('id') id: string): Promise<Employee | null> {
    return this.employeeService.findOneWithFiles(id);
  }

  // Update an employee
  @Put(':id')
  @RequirePermission('employee', 'update')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'verificationDocument', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() employeeData: Partial<IEmployeeCreateDTO>,
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      verificationDocument?: Express.Multer.File[];
    },
  ): Promise<Employee | null> {
    const allFiles: Express.Multer.File[] = [];
    if (files?.profilePhoto) allFiles.push(...files.profilePhoto);
    if (files?.verificationDocument)
      allFiles.push(...files.verificationDocument);

    return this.employeeService.update(id, employeeData, allFiles);
  }

  // Activate/Invite an employee user
  @Post(':id/activateUser')
  @RequirePermission('employee', 'update')
  async activateUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.employeeService.activateUser(id);
  }

  // Deactivate/Terminate an employee
  @Patch(':id/terminate')
  @RequirePermission('employee', 'delete')
  async terminate(@Param('id') id: string): Promise<Employee | null> {
    return this.employeeService.terminate(id);
  }

  // Delete an employee
  @Delete(':id')
  @RequirePermission('employee', 'delete')
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeeService.remove(id);
  }

  @Get('hierarchy/team')
  @RequirePermission('employee', 'read')
  async getTeamHierarchy(@Request() req: ApiRequestJWT): Promise<Employee[]> {
    return this.employeeService.getTeamHierarchy(req.user.organizationId);
  }

  // Get direct reports for a manager
  @Get(':id/reports')
  @RequirePermission('employee', 'read')
  async getDirectReports(@Param('id') id: string): Promise<Employee[]> {
    return this.employeeService.getDirectReports(id);
  }
}
