import { createZodDto } from 'nestjs-zod';
import { leadSchema } from '@repo/validation';

export class LeadDto extends createZodDto(leadSchema) {}
