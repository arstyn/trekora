import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadUpdateDto } from './create-lead-update.dto';

export class UpdateLeadUpdateDto extends PartialType(CreateLeadUpdateDto) {}
