import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CancellationTierItemTemplateDto } from './create-cancellation-tier-template.dto';

export class UpdateCancellationTierTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CancellationTierItemTemplateDto)
  tiers?: CancellationTierItemTemplateDto[];
}
