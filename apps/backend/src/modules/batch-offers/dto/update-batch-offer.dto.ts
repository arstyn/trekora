import { PartialType } from '@nestjs/mapped-types';
import { CreateBatchOfferDto } from './create-batch-offer.dto';

export class UpdateBatchOfferDto extends PartialType(CreateBatchOfferDto) {}
