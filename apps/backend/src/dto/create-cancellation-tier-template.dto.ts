import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CancellationTierItemTemplateDto {
  @IsString()
  @IsNotEmpty()
  timeframe: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateCancellationTierTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CancellationTierItemTemplateDto)
  tiers: CancellationTierItemTemplateDto[];

  @IsString()
  @IsOptional()
  organizationId?: string;
}
