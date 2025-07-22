/* eslint-disable @typescript-eslint/no-explicit-any */
// import { IUser } from "user/user.entity";

export interface ILeadUpdate {
	id: string;
	text: string;
	leadId: string;
	createdById: string;
	createdBy?: any;
	type: "note" | "status_change" | "email" | "call" | "meeting";
	metadata?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

export interface ILeadUpdateCreateDTO {
	text: string;
	leadId: string;
	type: "note" | "status_change" | "email" | "call" | "meeting";
	metadata?: Record<string, any>;
}
