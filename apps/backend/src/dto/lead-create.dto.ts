import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  IsUUID,
  IsNotEmpty,
  ValidateIf,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class LeadDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a valid text' })
  name: string;

  @IsOptional()
  @IsEnum(['individual', 'company'], {
    message: 'Lead type must be either individual or company',
  })
  leadType?: 'individual' | 'company';

  @IsOptional()
  @IsString({ message: 'Company must be a valid text' })
  company?: string;

  @IsOptional()
  @IsString({ message: 'Company website must be a valid text' })
  companyWebsite?: string;

  @IsOptional()
  @IsString({ message: 'Company industry must be a valid text' })
  companyIndustry?: string;

  @IsOptional()
  @IsString({ message: 'Contact designation must be a valid text' })
  contactDesignation?: string;

  @IsOptional()
  @IsString({ message: 'Company size must be a valid text' })
  companySize?: string;

  @IsOptional()
  @ValidateIf((o) => o.email !== '')
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a valid text' })
  phone?: string;

  @IsEnum(['new', 'contacted', 'qualified', 'lost', 'converted'], {
    message: 'Please select a valid status',
  })
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';

  @IsOptional()
  @IsString({ message: 'Notes must be a valid text' })
  notes?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Preferred package must be a valid UUID' })
  preferredPackageId?: string;

  @IsOptional()
  @IsArray({ message: 'Considered package IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each considered package ID must be a valid UUID' })
  consideredPackageIds?: string[];

  @IsOptional()
  @IsBoolean({ message: 'Custom package flag must be a boolean' })
  isCustomPackage?: boolean;

  @IsOptional()
  @IsString({ message: 'Custom package name must be a valid text' })
  customPackageName?: string;

  @IsOptional()
  @IsString({ message: 'Custom package destination must be a valid text' })
  customPackageDestination?: string;

  @IsOptional()
  @IsInt({ message: 'Custom package days must be an integer' })
  @Min(0, { message: 'Custom package days must be at least 0' })
  customPackageDays?: number;

  @IsOptional()
  @IsInt({ message: 'Custom package nights must be an integer' })
  @Min(0, { message: 'Custom package nights must be at least 0' })
  customPackageNights?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Custom package price must be a valid number' })
  @Min(0, { message: 'Custom package price must be at least 0' })
  customPackagePrice?: number;

  @IsOptional()
  @IsString({ message: 'Custom package description must be a valid text' })
  customPackageDescription?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Budget must be a valid number' })
  @Min(0, { message: 'Budget must be at least 0' })
  budget?: number;

  @IsOptional()
  @IsInt({ message: 'Number of passengers must be an integer' })
  @Min(1, { message: 'Number of passengers must be at least 1' })
  numberOfPassengers?: number;
}
