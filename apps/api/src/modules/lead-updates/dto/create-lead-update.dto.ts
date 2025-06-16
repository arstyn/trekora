import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateLeadUpdateDto {
  @IsString()
  text: string;

  @IsUUID()
  leadId: string;

  @IsEnum(['note', 'status_change', 'email', 'call', 'meeting'])
  @IsOptional()
  type?: 'note' | 'status_change' | 'email' | 'call' | 'meeting';

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
