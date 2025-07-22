export interface IOrganization {
	id: string;
	name?: string;
	domain?: string;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
}
