import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { PackageService } from './package.service';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('api/packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @RequirePermission('package', 'create')
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Request() req: ApiRequestJWT,
    @Body() createPackageDto: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.packageService.create(req.user, createPackageDto, files);
  }

  @Get()
  @RequirePermission('package', 'read')
  findAll(@Request() req: ApiRequestJWT, @Query('status') status?: string) {
    return this.packageService.findAll(req.user.organizationId, status);
  }

  @Get(':id/checklist')
  getPackageChecklist(@Param('id') id: string) {
    return this.packageService.getPackageChecklist(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packageService.findOne(id);
  }

  @Get(':id/basic')
  findBasic(@Param('id') id: string) {
    return this.packageService.findBasicInfo(id);
  }

  @Get(':id/itinerary')
  findItinerary(@Param('id') id: string) {
    return this.packageService.findItinerary(id);
  }

  @Get(':id/payments-cancellation')
  findPaymentsAndCancellation(@Param('id') id: string) {
    return this.packageService.findPaymentsAndCancellation(id);
  }

  @Get(':id/requirements')
  findRequirements(@Param('id') id: string) {
    return this.packageService.findRequirements(id);
  }

  @Get(':id/logistics')
  findLogistics(@Param('id') id: string) {
    return this.packageService.findLogistics(id);
  }

  @Patch(':id')
  @RequirePermission('package', 'update')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id') id: string,
    @Body() updatePackageDto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: ApiRequestJWT,
  ) {
    return this.packageService.update(id, updatePackageDto, files, req.user);
  }

  @Delete(':id')
  @RequirePermission('package', 'delete')
  remove(@Param('id') id: string, @Request() req: ApiRequestJWT) {
    return this.packageService.remove(id, req.user);
  }

  @Post(':id/validate')
  validatePackage(@Param('id') id: string) {
    return this.packageService.validatePackageForPublishing(id);
  }

  @Post(':id/publish')
  @RequirePermission('package', 'update')
  publishPackage(@Param('id') id: string, @Request() req: ApiRequestJWT) {
    return this.packageService.publishPackage(id, req.user);
  }

  @Get(':id/logs')
  @RequirePermission('package', 'read')
  getActivityLogs(@Param('id') id: string) {
    return this.packageService.getActivityLogs(id);
  }
}
