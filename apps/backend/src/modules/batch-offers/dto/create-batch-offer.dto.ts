import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  OfferDiscountMode,
  OfferDiscountScope,
  OfferDiscountType,
} from 'src/database/entity/batch-offer.entity';

export class CreateBatchOfferDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(OfferDiscountType)
  discountType: OfferDiscountType;

  @IsOptional()
  @IsEnum(OfferDiscountMode)
  discountMode?: OfferDiscountMode;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minDiscountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountValue?: number;

  @IsOptional()
  @IsEnum(OfferDiscountScope)
  discountScope?: OfferDiscountScope;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minTravelers?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountCap?: number;

  @IsOptional()
  validFrom?: string | Date;

  @IsOptional()
  validUntil?: string | Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
