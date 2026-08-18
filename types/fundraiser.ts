export type Fundraiser = {
	id: string;
	name: string;
	description: string;
	notes: string;
	startDate: Date;
	amount: number;
	status: "In Progress" | "Completed";
	distributionMethod: "Custom" | "Equal";
	collectionType: "Cash" | "Check" | "Venmo" | "Other";
};

// id          String           @id @default(cuid())
// name        String
// description String
// startDate   DateTime
// status      FundraiserStatus
