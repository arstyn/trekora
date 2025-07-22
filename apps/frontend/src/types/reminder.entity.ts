export interface IReminder {
	id: string;
	type: string;
	remindAt: string;
	repeat: string;
	entityType: string;
	entityId: string;
	note?: string;
}

export interface IReminderDTO {
	type: string;
	remindAt: string;
	repeat: string;
	entityType: string;
	entityId: string;
	note?: string;
}
