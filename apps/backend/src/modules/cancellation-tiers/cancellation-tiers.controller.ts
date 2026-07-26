import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { CreateCancellationTierTemplateDto } from 'src/dto/create-cancellation-tier-template.dto';
import { UpdateCancellationTierTemplateDto } from 'src/dto/update-cancellation-tier-template.dto';
import { CancellationTierTemplate } from '../../database/entity/cancellation-tier-template.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { CancellationTiersService } from './cancellation-tiers.service';

@UseGuards(AuthGuard)
@Controller('cancellation-tiers')
export class CancellationTiersController {
  constructor(private readonly cancellationTiersService: CancellationTiersService) {}

  private async checkAdminOrManager(req: ApiRequestJWT): Promise<void> {
    const isAuthorized = await this.cancellationTiersService.isAdminOrManager(
      req.user.userId,
      req.user.organizationId,
    );
    if (!isAuthorized) {
      throw new ForbiddenException(
        'Only Admin and Manager are allowed to perform this action',
      );
    }
  }

  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body() tierData: CreateCancellationTierTemplateDto,
  ): Promise<CancellationTierTemplate> {
    await this.checkAdminOrManager(req);
    return this.cancellationTiersService.create({
      ...tierData,
      createdById: req.user.userId,
      organizationId: req.user.organizationId,
    });
  }

  @Get()
  async get(@Request() req: ApiRequestJWT): Promise<CancellationTierTemplate[]> {
    return this.cancellationTiersService.findAll(req.user.organizationId);
  }

  @Get(':id')
  async getOne(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
  ): Promise<CancellationTierTemplate> {
    return this.cancellationTiersService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  async update(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() updateData: UpdateCancellationTierTemplateDto,
  ): Promise<CancellationTierTemplate> {
    await this.checkAdminOrManager(req);
    return this.cancellationTiersService.update(id, req.user.organizationId, updateData);
  }

  @Delete(':id')
  async remove(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
  ): Promise<CancellationTierTemplate> {
    await this.checkAdminOrManager(req);
    return this.cancellationTiersService.remove(id, req.user.organizationId);
  }
}
