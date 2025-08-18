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
import { PackageService } from './package.service';

@UseGuards(AuthGuard)
@Controller('api/packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Request() req: ApiRequestJWT,
    @Body() createPackageDto: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.packageService.create(req.user, createPackageDto, files);
  }

  @Get()
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

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id') id: string,
    @Body() updatePackageDto: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.packageService.update(id, updatePackageDto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packageService.remove(id);
  }

  @Post(':id/validate')
  validatePackage(@Param('id') id: string) {
    return this.packageService.validatePackageForPublishing(id);
  }

  @Post(':id/publish')
  publishPackage(@Param('id') id: string) {
    return this.packageService.publishPackage(id);
  }
}
