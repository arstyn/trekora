import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Gender } from '../database/entity/customer.entity';

export class RelativeDto {
  @IsNotEmpty({ message: 'Relative name is required' })
  @IsString({ message: 'Relative name must be a valid text' })
  name: string;

  @IsNotEmpty({ message: 'Relation is required' })
  @IsString({ message: 'Relation must be a valid text' })
  relation: string;

  @IsNotEmpty({ message: 'Relative phone is required' })
  @IsString({ message: 'Relative phone must be a valid text' })
  phone: string;

  @IsNotEmpty({ message: 'Relative address is required' })
  @IsString({ message: 'Relative address must be a valid text' })
  address: string;
}

export class CreateCustomerDto {
  // Personal Details
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a valid text' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a valid text' })
  lastName: string;

  @IsOptional()
  @IsString({ message: 'Middle name must be a valid text' })
  middleName?: string;

  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsDateString({}, { message: 'Please enter a valid date in YYYY-MM-DD format' })
  dateOfBirth: string;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsEnum(Gender, { message: 'Please select a valid gender' })
  gender: Gender;

  @IsOptional()
  @IsString({ message: 'Profile photo must be a valid URL' })
  profilePhoto?: string;

  // Contact Information
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a valid text' })
  phone: string;

  @IsOptional()
  @IsString({ message: 'Alternative phone must be a valid text' })
  alternativePhone?: string;

  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a valid text' })
  address: string;

  // Emergency Contact
  @IsOptional()
  @IsString({ message: 'Emergency contact name must be a valid text' })
  emergencyContactName?: string;

  @IsOptional()
  @IsString({ message: 'Emergency contact phone must be a valid text' })
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString({ message: 'Emergency contact relation must be a valid text' })
  emergencyContactRelation?: string;

  // Passport Details
  @IsOptional()
  @IsString({ message: 'Passport number must be a valid text' })
  passportNumber?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Passport expiry date must be a valid date in YYYY-MM-DD format' })
  passportExpiryDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Passport issue date must be a valid date in YYYY-MM-DD format' })
  passportIssueDate?: string;

  @IsOptional()
  @IsString({ message: 'Passport country must be a valid text' })
  passportCountry?: string;

  @IsOptional()
  @IsArray({ message: 'Passport photos must be an array' })
  @IsString({ each: true, message: 'Each passport photo must be a valid URL' })
  passportPhotos?: string[];

  // ID Documents
  @IsOptional()
  @IsString({ message: 'Voter ID must be a valid text' })
  voterId?: string;

  @IsOptional()
  @IsArray({ message: 'Voter ID photos must be an array' })
  @IsString({ each: true, message: 'Each voter ID photo must be a valid URL' })
  voterIdPhotos?: string[];

  @IsOptional()
  @IsString({ message: 'Aadhaar ID must be a valid text' })
  aadhaarId?: string;

  @IsOptional()
  @IsArray({ message: 'Aadhaar ID photos must be an array' })
  @IsString({ each: true, message: 'Each Aadhaar ID photo must be a valid URL' })
  aadhaarIdPhotos?: string[];

  // Relatives Information
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelativeDto)
  relatives?: RelativeDto[];

  // Travel Preferences
  @IsOptional()
  @IsString({ message: 'Dietary restrictions must be a valid text' })
  dietaryRestrictions?: string;

  @IsOptional()
  @IsString({ message: 'Medical conditions must be a valid text' })
  medicalConditions?: string;

  @IsOptional()
  @IsString({ message: 'Special requests must be a valid text' })
  specialRequests?: string;

  // Additional Information
  @IsOptional()
  @IsString({ message: 'Notes must be a valid text' })
  notes?: string;
}
