import { z } from 'zod';

export const leadSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    company: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'lost', 'converted']),
    notes: z.string().optional(),
    preferredPackageId: z.string().uuid().optional(),
    consideredPackageIds: z.array(z.string().uuid()).optional(),
    numberOfPassengers: z.number().int().min(1).default(1),
  })
  .strict();

export type LeadFormDTO = z.infer<typeof leadSchema>;
