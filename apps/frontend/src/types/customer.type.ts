export interface ICustomer {
	id?: string;
	name: string;
	email?: string;
	phone?: string;
	address?: string;
	notes?: string;
	status: string;
}

export interface Itinerary {
	id: string;
	customerId: string;
	destination: string;
	startDate: string;
	endDate: string;
	description?: string;
	status: string;
	totalCost: number;
}

export interface Group {
	id: string;
	name: string;
	type: string;
	memberIds: string[];
}
