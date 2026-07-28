import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { BatchBlock, BatchBlockStatus } from 'src/database/entity/batch-block.entity';
import { BatchLog } from 'src/database/entity/batch-log.entity';
import { Batch } from 'src/database/entity/batch.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { DataSource, EntityManager, LessThan, Repository } from 'typeorm';

@Injectable()
export class BatchBlocksService {
  constructor(
    @InjectRepository(BatchBlock)
    private readonly blockRepo: Repository<BatchBlock>,
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    private readonly dataSource: DataSource,
  ) { }

  private async logActionTrans(
    manager: EntityManager,
    batchId: string,
    userId: string,
    action: string,
    previousData: any,
    newData: any,
  ): Promise<void> {
    const log = manager.create(BatchLog, {
      batchId,
      changedById: userId,
      action,
      previousData,
      newData,
    });
    await manager.save(log);
  }

  async blockSlots(
    batchId: string,
    slots: number,
    reason: string,
    userId: string,
    organizationId: string,
  ): Promise<BatchBlock> {
    if (!slots || slots <= 0) {
      throw new BadRequestException('Slots must be a positive number');
    }

    const batch = await this.batchRepo.findOne({ where: { id: batchId, organizationId } });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const org = await this.orgRepo.findOne({ where: { id: organizationId } });
    const blockDays = org?.defaultBlockDays ?? 3;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + blockDays);

    return await this.dataSource.transaction(async (manager) => {
      const block = manager.create(BatchBlock, {
        batchId,
        organizationId,
        createdById: userId,
        slots,
        reason,
        status: BatchBlockStatus.ACTIVE,
        expiresAt,
      });

      const savedBlock = await manager.save(block);

      const oldBlockedSeats = batch.blockedSeats;

      batch.blockedSeats += slots;
      await manager.save(batch);

      await this.logActionTrans(
        manager,
        batchId,
        userId,
        'slots_blocked',
        { totalSeats: batch.totalSeats, blockedSeats: oldBlockedSeats },
        { totalSeats: batch.totalSeats, blockedSeats: batch.blockedSeats, slots, reason },
      );

      return savedBlock;
    });
  }

  async releaseBlock(
    batchId: string,
    blockId: string,
    userId: string,
    organizationId: string,
  ): Promise<BatchBlock> {
    const block = await this.blockRepo.findOne({
      where: { id: blockId, batchId, organizationId, status: BatchBlockStatus.ACTIVE },
    });

    if (!block) {
      throw new NotFoundException('Active batch block not found');
    }

    const batch = await this.batchRepo.findOne({ where: { id: batchId, organizationId } });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return await this.dataSource.transaction(async (manager) => {
      block.status = BatchBlockStatus.RELEASED;
      const savedBlock = await manager.save(block);

      const oldBlockedSeats = batch.blockedSeats;

      batch.blockedSeats = Math.max(0, batch.blockedSeats - block.slots);
      await manager.save(batch);

      await this.logActionTrans(
        manager,
        batchId,
        userId,
        'slots_released',
        { totalSeats: batch.totalSeats, blockedSeats: oldBlockedSeats },
        { totalSeats: batch.totalSeats, blockedSeats: batch.blockedSeats, slots: block.slots },
      );

      return savedBlock;
    });
  }

  async getBlocksForBatch(batchId: string, organizationId: string): Promise<BatchBlock[]> {
    return await this.blockRepo.find({
      where: { batchId, organizationId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  @Cron('*/10 * * * *') // Run every 10 minutes
  async autoExpireBlocks() {
    // We only query active blocks that have expired
    const now = new Date();
    const expiredBlocks = await this.blockRepo.find({
      where: {
        status: BatchBlockStatus.ACTIVE,
        expiresAt: LessThan(now),
      },
      relations: ['batch'],
    });

    for (const block of expiredBlocks) {
      try {
        const batch = block.batch;
        if (!batch) continue;

        await this.dataSource.transaction(async (manager) => {
          block.status = BatchBlockStatus.EXPIRED;
          await manager.save(block);

          const oldBlockedSeats = batch.blockedSeats;

          batch.blockedSeats = Math.max(0, batch.blockedSeats - block.slots);
          await manager.save(batch);

          await this.logActionTrans(
            manager,
            batch.id,
            block.createdById,
            'slots_expired',
            { totalSeats: batch.totalSeats, blockedSeats: oldBlockedSeats },
            { totalSeats: batch.totalSeats, blockedSeats: batch.blockedSeats, slots: block.slots },
          );
        });
      } catch (error) {
        console.error(`Failed to auto-expire batch block ${block.id}:`, error);
      }
    }
  }
}
