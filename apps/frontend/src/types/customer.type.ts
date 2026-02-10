export interface IRelative {
	name: string;
	relation: string;
	phone: string;
	address: string;
}

export interface ICustomer {
	id?: string;
	// Personal Details
	firstName: string;
	lastName: string;
	middleName?: string;
	dateOfBirth: string;
	gender: "male" | "female" | "other" | "prefer_not_to_say";
	profilePhoto?: string;

	// Contact Information
	email: string;
	phone: string;
	alternativePhone?: string;
	address: string;

	// Emergency Contact
	emergencyContactName?: string;
	emergencyContactPhone?: string;
	emergencyContactRelation?: string;

	// Passport Details
	passportNumber?: string;
	passportExpiryDate?: string;
	passportIssueDate?: string;
	passportCountry?: string;
	passportPhotos?: string[];

	// ID Documents
	voterId?: string;
	voterIdPhotos?: string[];
	aadhaarId?: string;
	aadhaarIdPhotos?: string[];

	// Relatives Information
	relatives?: IRelative[];

	// Travel Preferences
	dietaryRestrictions?: string;
	medicalConditions?: string;
	specialRequests?: string;

	// Additional Information
	notes?: string;
	createdBy?: {
		id: string;
		name?: string;
		email?: string;
	};
	createdAt?: string;
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
