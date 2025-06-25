import { IsEmail,IsEnum,IsNotEmpty,IsOptional,IsString } from "class-validator";
import { CustomerStatus } from "../entity/customer.entity";
import { CreateLeadUpdateDto } from "src/modules/lead-updates/dto/create-lead-update.dto";
export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}