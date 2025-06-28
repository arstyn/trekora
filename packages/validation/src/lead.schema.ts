import { z } from 'zod';

export const leadSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    company: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'lost', 'converted']),
    notes: z.string().optional(),
  })
  .strict();

export type LeadFormDTO = z.infer<typeof leadSchema>;
