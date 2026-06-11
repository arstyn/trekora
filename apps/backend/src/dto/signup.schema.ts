import { z } from 'zod';

const teamMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Combined schema for the entire form
export const onboardingSchema = z.object({
  // Auth validation
  otpToken: z.string().optional(),

  // Personal info
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),

  // Organization info
  orgName: z.string().optional(),
  orgSize: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),

  // Team info
  teamMembers: z.array(teamMemberSchema).optional(),

  // Preferences
  notifications: z.boolean().optional(),
  newsletter: z.boolean().optional(),
});

export type SignupFormDTO = z.infer<typeof onboardingSchema>;
