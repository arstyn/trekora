import { IsString, IsOptional, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MealItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  curry?: string;
}

export class IMealCreateDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

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
