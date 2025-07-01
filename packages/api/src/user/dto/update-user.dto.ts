import { IsString, IsEmail, IsOptional, IsUUID, IsBoolean, isString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
