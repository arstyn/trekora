import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ChecklistType } from 'src/database/entity/booking-checklist.entity';

export class CreateChecklistItemDto {
  @IsString()
  @MaxLength(500)
  item: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsBoolean()
  @IsOptional()
  mandatory?: boolean;

  @IsEnum(ChecklistType)
  type: ChecklistType;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateChecklistItemDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  item?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsBoolean()
  @IsOptional()
  mandatory?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class ChecklistItemResponseDto {
  id: string;
  item: string;
  completed: boolean;
  mandatory: boolean;
  type: ChecklistType;
  customerId?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ChecklistStatsDto {
  totalItems: number;
  completedItems: number;
  mandatoryItems: number;
  completedMandatoryItems: number;
  completionPercentage: number;
  mandatoryCompletionPercentage: number;
}

// Updated booking DTOs to include checklists
export class CreateBookingChecklistDto {
  @IsString()
  @MaxLength(500)
  item: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsBoolean()
  @IsOptional()
  mandatory?: boolean;

  @IsEnum(ChecklistType)
  @IsOptional()
  type?: ChecklistType;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class CreateBookingCustomerDto {
  @IsString()
  fullName: string;

  @IsNumber()
  age: number;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  emergencyContact: string;

  @IsString()
  @IsOptional()
  specialRequirements?: string;

  @IsOptional()
  checklist?: CreateBookingChecklistDto[];
}
