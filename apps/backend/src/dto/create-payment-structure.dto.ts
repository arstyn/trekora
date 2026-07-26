import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentMilestoneTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  dueDate: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreatePaymentStructureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentMilestoneTemplateDto)
  milestones: PaymentMilestoneTemplateDto[];

  @IsString()
  @IsOptional()
  organizationId?: string;
}
