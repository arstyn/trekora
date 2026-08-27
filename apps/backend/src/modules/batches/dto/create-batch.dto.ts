// create-batch.dto.ts
import { IsArray, IsDateString, IsInt, IsOptional, IsString, IsUUID, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomTierPriceDto {
  @IsUUID()
  packageTierId: string;

  @IsOptional()
  @IsNumber()
  adultCost?: number;

  @IsOptional()
  @IsString()
  childCostType?: 'flat' | 'percentage';

  @IsOptional()
  @IsNumber()
  childCostValue?: number;

  @IsOptional()
  @IsString()
  infantCostType?: 'flat' | 'percentage';

  @IsOptional()
  @IsNumber()
  infantCostValue?: number;
}


export class CreateBatchDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  totalSeats: number;

  @IsUUID()
  packageId: string;

  @IsArray()
  coordinators: string[];

  @IsOptional()
  @IsString()
  seatChangeReason?: string;

  @IsOptional()
  ignoreConflicts?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomTierPriceDto)
  customTierPrices?: CustomTierPriceDto[];
}
