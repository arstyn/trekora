import { IsString, IsOptional, IsEmail, IsArray, IsBoolean } from 'class-validator';

export class IEmployeeCreateDTO {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  departments?: string[];

  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive' | 'suspended' | 'terminated' | 'pending_activation';

  @IsString()
  @IsOptional()
  joinDate?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @IsString()
  @IsOptional()
  experience?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  additional_info?: string;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsArray()
  @IsOptional()
  emergencyContactName?: {
    name: string;
    phone: string;
    relation: string;
  }[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @IsString()
  @IsOptional()
  verificationDocument?: string;

  @IsString()
  @IsOptional()
  verificationDocumentType?: string;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  branchId?: string;
}
