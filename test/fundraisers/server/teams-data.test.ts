import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		team: {
			findMany: vi.fn(),
		},
		fundraiserTeam: {
			findMany: vi.fn(),
		},
		fundraiser: {
			findMany: vi.fn(),
		},
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	getFundraiserTeams,
	getTeamFundraisers,
	getAvailableFundraisersForTeam,
} from "@/features/fundraisers/data/fundraiserTeams";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getFundraiserTeams", () => {
	it("retrieves teams associated with a fundraiser ordered by name", async () => {
		const teams = [
			{ id: "team-1", name: "Varsity" },
			{ id: "team-2", name: "Junior Varsity" },
		];

		prismaMock.team.findMany.mockResolvedValue(teams);

		const result = await getFundraiserTeams("fundraiser-1");

		expect(prismaMock.team.findMany).toHaveBeenCalledWith({
			where: {
				fundraiserTeams: {
					some: {
						fundraiserId: "fundraiser-1",
					},
				},
			},
			orderBy: {
				name: "asc",
			},
		});

		expect(result).toEqual(teams);
	});
});

describe("getTeamFundraisers", () => {
	it("returns fundraisers associated with a team", async () => {
		const fundraiser1 = {
			id: "fundraiser-1",
			name: "Cookie Sale",
		};
		const fundraiser2 = {
			id: "fundraiser-2",
			name: "Car Wash",
		};

		prismaMock.fundraiserTeam.findMany.mockResolvedValue([
			{ fundraiser: fundraiser1 },
			{ fundraiser: fundraiser2 },
		]);

		const result = await getTeamFundraisers("team-1");

		expect(prismaMock.fundraiserTeam.findMany).toHaveBeenCalledWith({
			where: { teamId: "team-1" },
			include: { fundraiser: true },
		});

		expect(result).toEqual([fundraiser1, fundraiser2]);
	});
});

describe("getAvailableFundraisersForTeam", () => {
	it("returns incomplete fundraisers not already associated with the team", async () => {
		const fundraisers = [
			{ id: "fundraiser-1", name: "Cookie Sale", isCompleted: false },
			{ id: "fundraiser-2", name: "Car Wash", isCompleted: false },
		];

		prismaMock.fundraiser.findMany.mockResolvedValue(fundraisers);

		const result = await getAvailableFundraisersForTeam("team-1");

		expect(prismaMock.fundraiser.findMany).toHaveBeenCalledWith({
			where: {
				isCompleted: false,
				teams: {
					none: {
						teamId: "team-1",
					},
				},
			},
		});

		expect(result).toEqual(fundraisers);
	});
});
