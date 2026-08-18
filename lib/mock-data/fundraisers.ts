import type { Fundraiser } from "@/types/fundraiser";

export const mockFundraisers: Fundraiser[] = [
	{
		id: "fundraiser-1",
		name: "July Pandas",
		description: "Partner with Pandas",
		startDate: new Date("07-11-2025"),
		status: "ACTIVE",
	},
	{
		id: "fundraiser-2",
		name: "test",
		description: "test fundraiser",
		startDate: new Date("07-12-2025"),
		status: "COMPLETED",
	},
];
