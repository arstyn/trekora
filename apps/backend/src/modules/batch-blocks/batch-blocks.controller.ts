import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { AuthGuard } from '../auth/guard/auth.guard';
import { BatchBlocksService } from './batch-blocks.service';

@UseGuards(AuthGuard)
@Controller('batches')
export class BatchBlocksController {
  constructor(private readonly batchBlocksService: BatchBlocksService) { }

  @Post(':id/block')
  async blockSlots(
    @Param('id') batchId: string,
    @Body() body: { slots: number; reason?: string },
    @Request() req: ApiRequestJWT,
  ) {
    return await this.batchBlocksService.blockSlots(
      batchId,
      body.slots,
      body.reason || '',
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Post(':id/release-block/:blockId')
  async releaseBlock(
    @Param('id') batchId: string,
    @Param('blockId') blockId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return await this.batchBlocksService.releaseBlock(
      batchId,
      blockId,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get(':id/blocks')
  async getBlocksForBatch(
    @Param('id') batchId: string,
    @Request() req: ApiRequestJWT,
  ) {
    return await this.batchBlocksService.getBlocksForBatch(
      batchId,
      req.user.organizationId,
    );
  }
}
