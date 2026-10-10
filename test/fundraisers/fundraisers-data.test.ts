import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiser: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
		},
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	getFundraisers,
	getInCompleteFundraisers,
	getFundraiserById,
	getFundraiserWithTeams,
	getFundraiserWithParticipants,
	getPublishedFundraisersByPlayer,
} from "@/features/fundraisers/data/fundraisers";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getFundraisers", () => {
	it("gets all fundraisers without a search term", async () => {
		const fundraisers = [
			{ id: "fundraiser-1", name: "Cookie Sale" },
			{ id: "fundraiser-2", name: "Car Wash" },
		];

		prismaMock.fundraiser.findMany.mockResolvedValue(fundraisers);

		const result = await getFundraisers();

		expect(prismaMock.fundraiser.findMany).toHaveBeenCalledWith({
			where: undefined,
			orderBy: { startDate: "desc" },
		});
		expect(result).toEqual(fundraisers);
	});

	it("filters fundraisers by name when a search term is provided", async () => {
		const fundraisers = [{ id: "fundraiser-1", name: "Cookie Sale" }];

		prismaMock.fundraiser.findMany.mockResolvedValue(fundraisers);

		const result = await getFundraisers("cookie");

		expect(prismaMock.fundraiser.findMany).toHaveBeenCalledWith({
			where: {
				name: {
					contains: "cookie",
					mode: "insensitive",
				},
			},
			orderBy: { startDate: "desc" },
		});
		expect(result).toEqual(fundraisers);
	});
});

describe("getInCompleteFundraisers", () => {
	it("gets all incomplete fundraisers ordered by start date", async () => {
		const fundraisers = [
			{ id: "fundraiser-1", name: "Cookie Sale", isCompleted: false },
		];

		prismaMock.fundraiser.findMany.mockResolvedValue(fundraisers);

		const result = await getInCompleteFundraisers();

		expect(prismaMock.fundraiser.findMany).toHaveBeenCalledWith({
			where: { isCompleted: false },
			orderBy: { startDate: "desc" },
		});
		expect(result).toEqual(fundraisers);
	});
});

describe("getFundraiserById", () => {
	it("gets a fundraiser by its ID", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			name: "Cookie Sale",
		};

		prismaMock.fundraiser.findUnique.mockResolvedValue(fundraiser);

		const result = await getFundraiserById("fundraiser-1");

		expect(prismaMock.fundraiser.findUnique).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
		});
		expect(result).toEqual(fundraiser);
	});
});

describe("getFundraiserWithTeams", () => {
	it("gets a fundraiser with its associated teams", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			name: "Cookie Sale",
			teams: [
				{
					teamId: "team-1",
					team: { id: "team-1", name: "Varsity" },
				},
			],
		};

		prismaMock.fundraiser.findUnique.mockResolvedValue(fundraiser);

		const result = await getFundraiserWithTeams("fundraiser-1");

		expect(prismaMock.fundraiser.findUnique).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			include: {
				teams: {
					include: {
						team: true,
					},
				},
			},
		});
		expect(result).toEqual(fundraiser);
	});
});

describe("getFundraiserWithParticipants", () => {
	it("gets a fundraiser with its participants and player details", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			name: "Cookie Sale",
			participants: [
				{
					playerId: "player-1",
					player: { id: "player-1", firstName: "Alex" },
				},
			],
		};

		prismaMock.fundraiser.findUnique.mockResolvedValue(fundraiser);

		const result = await getFundraiserWithParticipants("fundraiser-1");

		expect(prismaMock.fundraiser.findUnique).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			include: {
				participants: {
					include: {
						player: true,
					},
				},
			},
		});
		expect(result).toEqual(fundraiser);
	});
});

describe("getPublishedFundraisersByPlayer", () => {
	it("gets published fundraisers for a player with active allocations", async () => {
		const fundraisers = [
			{
				id: "fundraiser-1",
				name: "Cookie Sale",
				participants: [
					{
						playerId: "player-1",
						allocations: [{ id: "allocation-1", amount: 50, status: "ACTIVE" }],
					},
				],
			},
		];

		prismaMock.fundraiser.findMany.mockResolvedValue(fundraisers);

		const result = await getPublishedFundraisersByPlayer("player-1");

		expect(prismaMock.fundraiser.findMany).toHaveBeenCalledWith({
			where: {
				isPublished: true,
				participants: {
					some: { playerId: "player-1" },
				},
			},
			include: {
				participants: {
					where: { playerId: "player-1" },
					include: {
						allocations: {
							where: { status: "ACTIVE" },
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		expect(result).toEqual(fundraisers);
	});
});
