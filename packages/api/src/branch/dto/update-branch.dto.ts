import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class IBranchUpdateDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  organizationId?: string;

  @IsOptional()
  isActive?: boolean;
}