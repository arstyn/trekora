import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  ApprovalAction,
  ApprovalStatus,
} from 'src/database/entity/approval-request.entity';

export class ApprovalFilterDto {
  @IsEnum(ApprovalStatus)
  @IsOptional()
  status?: ApprovalStatus;

  @IsEnum(ApprovalAction)
  @IsOptional()
  action?: ApprovalAction;

  @IsString()
  @IsOptional()
  resource?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
