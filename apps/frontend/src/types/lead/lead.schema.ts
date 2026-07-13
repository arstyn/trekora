import { z } from "zod";

export const leadSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		leadType: z.enum(["individual", "company"]).default("individual"),
		company: z.string().optional().nullable(),
		companyWebsite: z.string().optional().nullable(),
		companyIndustry: z.string().optional().nullable(),
		contactDesignation: z.string().optional().nullable(),
		companySize: z.string().optional().nullable(),
		email: z.string().optional().nullable(),
		phone: z.string().optional().nullable(),
		status: z.enum(["new", "contacted", "qualified", "lost", "converted"]),
		notes: z.string().optional().nullable(),
		preferredPackageId: z.string().uuid().optional().nullable(),
		consideredPackageIds: z.array(z.string().uuid()).optional().default([]),
		isCustomPackage: z.boolean().optional().default(false),
		customPackageName: z.string().optional().nullable(),
		customPackageDestination: z.string().optional().nullable(),
		customPackageDays: z.number().int().min(0).optional().nullable(),
		customPackageNights: z.number().int().min(0).optional().nullable(),
		customPackagePrice: z.number().min(0).optional().nullable(),
		customPackageDescription: z.string().optional().nullable(),
		budget: z.number().min(0).optional().nullable(),
		numberOfPassengers: z.number().int().min(1).optional().default(1),
	})
	.strict();

export type LeadFormDTO = z.infer<typeof leadSchema>;
