import { createZodDto } from 'nestjs-zod';
import { leadSchema } from './lead.schema';

export class LeadDto extends createZodDto(leadSchema) {}
