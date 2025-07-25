// create-batch.dto.ts
import { IsUUID, IsDateString, IsInt, IsString } from 'class-validator';

export class CreateBatchDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  totalSeats: number;

  @IsInt()
  bookedSeats: number;

  @IsString()
  status: string;

  @IsUUID()
  packageId: string;
}
