import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Gender } from '../database/entity/customer.entity';
import { Type } from 'class-transformer';

export class RelativeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  relation: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}

export class CreateCustomerDto {
  // Personal Details
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  profilePhoto?: string;

  // Contact Information
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  alternativePhone?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  // Emergency Contact
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  // Passport Details
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsOptional()
  @IsDateString()
  passportExpiryDate?: string;

  @IsOptional()
  @IsDateString()
  passportIssueDate?: string;

  @IsOptional()
  @IsString()
  passportCountry?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  passportPhotos?: string[];

  // ID Documents
  @IsOptional()
  @IsString()
  voterId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  voterIdPhotos?: string[];

  @IsOptional()
  @IsString()
  aadhaarId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aadhaarIdPhotos?: string[];

  // Relatives Information
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelativeDto)
  relatives?: RelativeDto[];

  // Travel Preferences
  @IsOptional()
  @IsString()
  dietaryRestrictions?: string;

  @IsOptional()
  @IsString()
  medicalConditions?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  // Additional Information
  @IsOptional()
  @IsString()
  notes?: string;
}
