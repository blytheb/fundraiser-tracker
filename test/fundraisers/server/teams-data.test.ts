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


describe("getAvailableFundraisersForTeam", () => {
	it("returns incomplete fundraisers not already associated with the team", async () => {
		const fundraisers = [
			{ id: "fundraiser-1", name: "Cookie Sale", status: "DRAFT" },
			{ id: "fundraiser-2", name: "Car Wash", status: "DRAFT" },
		];

		prismaMock.fundraiser.findMany.mockResolvedValue(fundraisers);

		const result = await getAvailableFundraisersForTeam("team-1");

		expect(prismaMock.fundraiser.findMany).toHaveBeenCalledWith({
			where: {
				status: "DRAFT",
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
