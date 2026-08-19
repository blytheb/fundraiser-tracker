import type { Fundraiser } from "@/types/fundraiser";
import type { Team } from "@/types/team";

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

export const mockTestFundraiser: Fundraiser = {
	id: "fundraiser-1",
	name: "July Pandas",
	description: "Partner with Pandas",
	startDate: new Date("07-11-2025"),
	status: "ACTIVE",
};

export const mockTestActiveTeams: Team[] = [
	{
		id: "team-1",
		name: "18U Girls",
		status: "IN_SEASON",
		imageUrl: "https://robohash.org/1",
	},
	{
		id: "team-2",
		name: "16U Girls",
		status: "IN_SEASON",
		imageUrl: "https://robohash.org/2",
	},
];
