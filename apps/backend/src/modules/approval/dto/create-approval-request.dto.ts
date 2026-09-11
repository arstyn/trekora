import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApprovalAction } from 'src/database/entity/approval-request.entity';

export class CreateApprovalRequestDto {
  @IsEnum(ApprovalAction)
  @IsNotEmpty()
  action: ApprovalAction;

  @IsString()
  @IsNotEmpty()
  resource: string;

  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @IsString()
  @IsOptional()
  entityReference?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsObject()
  @IsOptional()
  payload?: Record<string, any>;

  @IsObject()
  @IsOptional()
  snapshot?: Record<string, any>;
}
