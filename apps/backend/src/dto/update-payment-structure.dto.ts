import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMilestoneTemplateDto } from './create-payment-structure.dto';

export class UpdatePaymentStructureDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PaymentMilestoneTemplateDto)
  milestones?: PaymentMilestoneTemplateDto[];
}
