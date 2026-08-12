export type Fundraiser = {
	id: string;
	name: string;
	description: string;
	notes: string;
	startDate: Date;
	status: "Active" | "Draft" | "Completed" | "Cancelled";
	distributionMethod: "Custom" | "Equal";
	collectionType: "Cash" | "Check" | "Venmo" | "Other";
	scope: "Team" | "All";
};
