import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { BatchOffersService } from './batch-offers.service';
import { CreateBatchOfferDto } from './dto/create-batch-offer.dto';
import { UpdateBatchOfferDto } from './dto/update-batch-offer.dto';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('batches')
export class BatchOffersController {
  constructor(private readonly batchOffersService: BatchOffersService) {}

  @Post(':id/offers')
  @RequirePermission('batch-offer', 'create')
  async create(
    @Param('id') batchId: string,
    @Body() dto: CreateBatchOfferDto,
    @Request() req: ApiRequestJWT,
  ) {
    return await this.batchOffersService.create(
      batchId,
      dto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get(':id/offers')
  @RequirePermission('batch-offer', 'read')
  async findAllByBatch(
    @Param('id') batchId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return await this.batchOffersService.findAllByBatch(
      batchId,
      req.user.organizationId,
    );
  }

  @Get(':id/offers/active')
  async findActiveOffers(
    @Param('id') batchId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return await this.batchOffersService.findActiveOffersForBatch(
      batchId,
      req.user.organizationId,
    );
  }

  @Get('offers/:offerId')
  @RequirePermission('batch-offer', 'read')
  async findOne(
    @Param('offerId') offerId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return await this.batchOffersService.findOne(
      offerId,
      req.user.organizationId,
    );
  }

  @Patch(':id/offers/:offerId')
  @RequirePermission('batch-offer', 'update')
  async update(
    @Param('id') batchId: string,
    @Param('offerId') offerId: string,
    @Body() dto: UpdateBatchOfferDto,
    @Request() req: ApiRequestJWT,
  ) {
    return await this.batchOffersService.update(
      batchId,
      offerId,
      dto,
      req.user.organizationId,
    );
  }

  @Patch(':id/offers/:offerId/toggle')
  @RequirePermission('batch-offer', 'update')
  async toggleStatus(
    @Param('id') batchId: string,
    @Param('offerId') offerId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return await this.batchOffersService.toggleStatus(
      batchId,
      offerId,
      req.user.organizationId,
    );
  }

  @Delete(':id/offers/:offerId')
  @RequirePermission('batch-offer', 'delete')
  async remove(
    @Param('id') batchId: string,
    @Param('offerId') offerId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return await this.batchOffersService.remove(
      batchId,
      offerId,
      req.user.organizationId,
    );
  }
}
