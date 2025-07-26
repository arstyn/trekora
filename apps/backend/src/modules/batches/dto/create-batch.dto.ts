// create-batch.dto.ts
import { IsArray, IsDateString, IsInt, IsUUID } from 'class-validator';

export class CreateBatchDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  totalSeats: number;

  @IsUUID()
  packageId: string;

  @IsArray()
  coordinators: string[];
}
