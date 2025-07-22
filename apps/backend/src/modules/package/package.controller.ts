import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { PackageFormData } from 'src/dto/package.schema';

@UseGuards(AuthGuard)
@Controller('api/packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  create(
    @Request() req: ApiRequestJWT,
    @Body() createPackageDto: PackageFormData,
  ) {
    return this.packageService.create(req.user, createPackageDto);
  }

  @Get()
  findAll(@Request() req: ApiRequestJWT) {
    return this.packageService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packageService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: PackageFormData) {
    return this.packageService.update(id, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packageService.remove(id);
  }
}
