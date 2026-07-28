import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { BatchStatus } from 'src/database/entity/batch.entity';
import { CreateBatchDto } from './create-batch.dto';

export class UpdateBatchDto extends PartialType(CreateBatchDto) {
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;
}
