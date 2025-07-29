import type { IOrganization } from "./organization.types";
import { z } from "zod";

export interface IBranch {
	id: string;
	organizationId?: string;
	organization: IOrganization;
	name: string;
	location?: string;
	createdAt: string;
	isActive: boolean;
}

export const branchSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		location: z.string().optional(),
	})
	.strict();

export type BranchFormDTO = z.infer<typeof branchSchema>;
