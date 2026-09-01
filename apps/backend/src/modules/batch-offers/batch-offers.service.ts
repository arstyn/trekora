import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch } from 'src/database/entity/batch.entity';
import { BatchOffer } from 'src/database/entity/batch-offer.entity';
import { Repository } from 'typeorm';
import { CreateBatchOfferDto } from './dto/create-batch-offer.dto';
import { UpdateBatchOfferDto } from './dto/update-batch-offer.dto';

@Injectable()
export class BatchOffersService {
  constructor(
    @InjectRepository(BatchOffer)
    private readonly batchOfferRepository: Repository<BatchOffer>,
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  async create(
    batchId: string,
    dto: CreateBatchOfferDto,
    userId: string,
    organizationId: string,
  ): Promise<BatchOffer> {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId, organizationId },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (dto.validFrom && dto.validUntil) {
      const from = new Date(dto.validFrom);
      const until = new Date(dto.validUntil);
      if (from > until) {
        throw new BadRequestException('validFrom cannot be after validUntil');
      }
    }

    const offer = this.batchOfferRepository.create({
      ...dto,
      batchId,
      organizationId,
      createdById: userId,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
    });

    return await this.batchOfferRepository.save(offer);
  }

  async findAllByBatch(
    batchId: string,
    organizationId: string,
  ): Promise<BatchOffer[]> {
    return await this.batchOfferRepository.find({
      where: { batchId, organizationId },
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
  }

  async findActiveOffersForBatch(
    batchId: string,
    organizationId?: string,
  ): Promise<BatchOffer[]> {
    const query = this.batchOfferRepository
      .createQueryBuilder('offer')
      .where('offer.batchId = :batchId', { batchId })
      .andWhere('offer.isActive = true');

    if (organizationId) {
      query.andWhere('offer.organizationId = :organizationId', {
        organizationId,
      });
    }

    const now = new Date();
    query.andWhere(
      '(offer.validUntil IS NULL OR offer.validUntil >= :now)',
      { now },
    );

    query.orderBy('offer.createdAt', 'DESC');
    return await query.getMany();
  }

  async findOne(id: string, organizationId: string): Promise<BatchOffer> {
    const offer = await this.batchOfferRepository.findOne({
      where: { id, organizationId },
      relations: ['batch', 'createdBy'],
    });
    if (!offer) {
      throw new NotFoundException('Batch special offer not found');
    }
    return offer;
  }

  async update(
    batchId: string,
    offerId: string,
    dto: UpdateBatchOfferDto,
    organizationId: string,
  ): Promise<BatchOffer> {
    const offer = await this.batchOfferRepository.findOne({
      where: { id: offerId, batchId, organizationId },
    });
    if (!offer) {
      throw new NotFoundException('Batch special offer not found');
    }

    if (dto.validFrom && dto.validUntil) {
      const from = new Date(dto.validFrom);
      const until = new Date(dto.validUntil);
      if (from > until) {
        throw new BadRequestException('validFrom cannot be after validUntil');
      }
    }

    Object.assign(offer, {
      ...dto,
      validFrom:
        dto.validFrom !== undefined
          ? dto.validFrom
            ? new Date(dto.validFrom)
            : null
          : offer.validFrom,
      validUntil:
        dto.validUntil !== undefined
          ? dto.validUntil
            ? new Date(dto.validUntil)
            : null
          : offer.validUntil,
    });

    return await this.batchOfferRepository.save(offer);
  }

  async toggleStatus(
    batchId: string,
    offerId: string,
    organizationId: string,
  ): Promise<BatchOffer> {
    const offer = await this.batchOfferRepository.findOne({
      where: { id: offerId, batchId, organizationId },
    });
    if (!offer) {
      throw new NotFoundException('Batch special offer not found');
    }

    offer.isActive = !offer.isActive;
    return await this.batchOfferRepository.save(offer);
  }

  async remove(
    batchId: string,
    offerId: string,
    organizationId: string,
  ): Promise<{ success: boolean; message: string }> {
    const offer = await this.batchOfferRepository.findOne({
      where: { id: offerId, batchId, organizationId },
    });
    if (!offer) {
      throw new NotFoundException('Batch special offer not found');
    }

    await this.batchOfferRepository.remove(offer);
    return { success: true, message: 'Special offer removed successfully' };
  }
}
