import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { WorkflowType } from '../database/entity/workflow/workflow.entity';
import { WorkflowStepStatus } from '../database/entity/workflow/workflow-step.entity';

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(WorkflowType)
  type: WorkflowType;

  @IsUUID()
  @IsOptional()
  referenceId?: string;

  @IsUUID()
  @IsOptional()
  organizationId?: string;
}

export class CreateWorkflowStepDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsOptional()
  config?: Record<string, any>;

  @IsEnum(['individual', 'common'])
  @IsOptional()
  type?: 'individual' | 'common';
}

export class UpdateWorkflowStepDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsEnum(WorkflowStepStatus)
  @IsOptional()
  status?: WorkflowStepStatus;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsOptional()
  config?: Record<string, any>;

  @IsEnum(['individual', 'common'])
  @IsOptional()
  type?: 'individual' | 'common';
}

export class WorkflowHistoryDto {
  stepId?: string;
  action: string;
  previousData: any;
  newData: any;
  changedByName: string;
  createdAt: Date;
}
