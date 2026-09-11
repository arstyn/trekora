import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ReviewApprovalRequestDto {
  @IsString()
  @IsOptional()
  reviewNotes?: string;

  @IsObject()
  @IsOptional()
  adjustedPayload?: Record<string, any>;
}

export class RejectApprovalRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'A rejection reason is required' })
  reason: string;
}
