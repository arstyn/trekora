import { z } from "zod";

const teamMemberSchema = z.object({
	email: z.email("Please enter a valid email address"),
	role: z.enum(["admin", "manager", "employee", "user"]),
});

// Combined schema for the entire form
export const onboardingSchema = z.object({
	otpToken: z.string().optional(),

	// Personal info
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
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
