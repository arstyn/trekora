import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ClearDataDto {
  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsOptional()
  @IsBoolean()
  bookings?: boolean;

  @IsOptional()
  @IsBoolean()
  batches?: boolean;

  @IsOptional()
  @IsBoolean()
  customers?: boolean;

  @IsOptional()
  @IsBoolean()
  leads?: boolean;

  @IsOptional()
  @IsBoolean()
  employees?: boolean;

  @IsOptional()
  @IsBoolean()
  packages?: boolean;

  @IsOptional()
  @IsBoolean()
  payments?: boolean;

  @IsOptional()
  @IsBoolean()
  workflows?: boolean;
}
