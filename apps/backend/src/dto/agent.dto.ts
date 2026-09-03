import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AgentStatus, CommissionType } from '../database/entity/agent.entity';

export class CreateAgentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  agencyName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(CommissionType)
  commissionType: CommissionType;

  @IsNumber()
  @Min(0)
  commissionValue: number;

  @IsOptional()
  @IsEnum(AgentStatus)
  status?: AgentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  agencyName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(CommissionType)
  commissionType?: CommissionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionValue?: number;

  @IsOptional()
  @IsEnum(AgentStatus)
  status?: AgentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AgentResponseDto {
  id: string;
  name: string;
  agencyName?: string;
  email?: string;
  phone?: string;
  commissionType: CommissionType;
  commissionValue: number;
  status: AgentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  totalBookings?: number;
  totalCommissionEarned?: number;
  totalCommissionPaid?: number;
  pendingCommissionPayout?: number;
}
