import { IsString, IsOptional, IsNotEmpty, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class MealItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  curry?: string;

  @IsNumber()
  @IsOptional()
  price?: number;
}

export class IMealCreateDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  breakfast?: MealItemDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  lunch?: MealItemDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  dinner?: MealItemDto[];

  @IsString()
  @IsOptional()
  organizationId?: string;
}
