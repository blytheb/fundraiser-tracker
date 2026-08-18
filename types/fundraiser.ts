export type Fundraiser = {
	id: string;
	name: string;
	description: string;
	startDate: Date;
	status: "ACTIVE" | "COMPLETED";
};
