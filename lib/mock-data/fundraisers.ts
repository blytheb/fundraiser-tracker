import type { Fundraiser } from "@/types/fundraiser";

export const mockFundraisers: Fundraiser[] = [
	{
		id: "fundraiser-1",
		name: "Fundies #1",
		description: "first fundraiser of the year",
		startDate: new Date("1-2-2020"),
		status: "Completed",
	},
	{
		id: "fundraiser-2",
		name: "Raise Money",
		startDate: new Date("1-3-2020"),
		status: "Completed",
	},
	{
		id: "fundraiser-3",
		name: "Nother Money Maker",
		description: "big fundraiser",
		startDate: new Date("1-4-2020"),
		status: "In Progress",
	},
	{
		id: "fundraiser-4",
		name: "Fundies #4",
		description: "last fundraiser of the year",
		startDate: new Date("1-5-2020"),
		status: "In Progress",
	},
];
