export type Fundraiser = {
	id: string;
	name: string;
	description: string | null;
	startDate: Date;
	status: "In Progress" | "Completed";
	// created_at: Date;
};
