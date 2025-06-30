import { createZodDto } from 'nestjs-zod';
import { leadSchema } from '@repo/validation/src/lead.schema';

export class LeadDto extends createZodDto(leadSchema) {}
