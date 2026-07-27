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
import { CreatePaymentStructureDto } from 'src/dto/create-payment-structure.dto';
import { UpdatePaymentStructureDto } from 'src/dto/update-payment-structure.dto';
import { PaymentStructureTemplate } from '../../database/entity/payment-structure-template.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PaymentStructuresService } from './payment-structures.service';

@UseGuards(AuthGuard)
@Controller('payment-structures')
export class PaymentStructuresController {
  constructor(private readonly paymentStructuresService: PaymentStructuresService) {}

  private async checkAdminOrManager(req: ApiRequestJWT): Promise<void> {
    const isAuthorized = await this.paymentStructuresService.isAdminOrManager(
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
    @Body() paymentData: CreatePaymentStructureDto,
  ): Promise<PaymentStructureTemplate> {
    await this.checkAdminOrManager(req);
    return this.paymentStructuresService.create({
      ...paymentData,
      createdById: req.user.userId,
      organizationId: req.user.organizationId,
    });
  }

  @Get()
  async get(@Request() req: ApiRequestJWT): Promise<PaymentStructureTemplate[]> {
    return this.paymentStructuresService.findAll(req.user.organizationId);
  }

  @Get(':id')
  async getOne(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
  ): Promise<PaymentStructureTemplate> {
    return this.paymentStructuresService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  async update(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() updateData: UpdatePaymentStructureDto,
  ): Promise<PaymentStructureTemplate> {
    await this.checkAdminOrManager(req);
    return this.paymentStructuresService.update(id, req.user.organizationId, updateData);
  }

  @Delete(':id')
  async remove(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
  ): Promise<PaymentStructureTemplate> {
    await this.checkAdminOrManager(req);
    return this.paymentStructuresService.remove(id, req.user.organizationId);
  }
}
