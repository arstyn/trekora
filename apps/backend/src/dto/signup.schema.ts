import { z } from 'zod';

const teamMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Combined schema for the entire form
export const onboardingSchema = z.object({
  // Auth validation
  otpToken: z.string().optional(),

  // Personal info
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),

  // Organization info
  orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
  orgSize: z.string().min(1, 'Please select organization size'),
  industry: z.string().min(1, 'Please select industry'),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),

  // Team info
  teamMembers: z.array(teamMemberSchema),

  // Preferences
  notifications: z.boolean(),
  newsletter: z.boolean(),
});

export type SignupFormDTO = z.infer<typeof onboardingSchema>;
