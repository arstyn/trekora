import { IsString, IsEmail, IsOptional, IsUUID, IsBoolean, IsDateString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;
}
