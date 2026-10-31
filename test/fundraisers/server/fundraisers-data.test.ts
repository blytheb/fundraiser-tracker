import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiser: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
		},
		parentPlayerLink: {
			findUnique: vi.fn(),
		},
	},
}));
const { requireUserMock } = vi.hoisted(() => ({
	requireUserMock: vi.fn(),
}));

vi.mock("@/lib/permissions", () => ({
	requireUser: requireUserMock,
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	getFundraisers,
	getFundraiserById,
	getFundraiserWithTeams,
	getFundraiserWithParticipants,
	getPublishedFundraisersByPlayer,
} from "@/features/fundraisers/data/fundraisers";

beforeEach(() => {
	vi.clearAllMocks();
	requireUserMock.mockResolvedValue({
		id: "parent-1",
		role: "PARENT",
	});
	prismaMock.parentPlayerLink.findUnique.mockResolvedValue({
		userId: "parent-1",
		playerId: "player-1",
	} as never);
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
	it("gets published fundraisers for a player with active distribution transactions", async () => {
		const fundraisers = [
			{
				id: "fundraiser-1",
				name: "Cookie Sale",
				status: "PUBLISHED",
				transactions: [
					{
						id: "transaction-1",
						playerId: "player-1",
						amount: 50,
						type: "DISTRIBUTION",
						status: "ACTIVE",
					},
				],
			},
		];

		prismaMock.fundraiser.findMany.mockResolvedValue(fundraisers);

		const result = await getPublishedFundraisersByPlayer("player-1");

		expect(prismaMock.fundraiser.findMany).toHaveBeenCalledWith({
			where: {
				status: "PUBLISHED",
				participants: {
					some: {
						playerId: "player-1",
					},
				},
			},
			include: {
				transactions: {
					where: {
						playerId: "player-1",
						status: "ACTIVE",
						type: "DISTRIBUTION",
					},
					orderBy: {
						date: "desc",
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		expect(result).toEqual(fundraisers);
	});
	it("does not include allocations in the query", async () => {
		prismaMock.fundraiser.findMany.mockResolvedValue([]);

		await getPublishedFundraisersByPlayer("player-1");

		const query = prismaMock.fundraiser.findMany.mock.calls[0][0];

		expect(query.include).not.toHaveProperty("participants");
		expect(query.include).not.toHaveProperty("allocations");
		expect(query.include).toHaveProperty("transactions");
	});

	it("filters transactions by player, active status, and distribution type", async () => {
		prismaMock.fundraiser.findMany.mockResolvedValue([]);

		await getPublishedFundraisersByPlayer("player-1");

		const query = prismaMock.fundraiser.findMany.mock.calls[0][0];

		expect(query.include.transactions.where).toEqual({
			playerId: "player-1",
			status: "ACTIVE",
			type: "DISTRIBUTION",
		});
	});

	it("orders distribution transactions by date descending", async () => {
		prismaMock.fundraiser.findMany.mockResolvedValue([]);

		await getPublishedFundraisersByPlayer("player-1");

		const query = prismaMock.fundraiser.findMany.mock.calls[0][0];

		expect(query.include.transactions.orderBy).toEqual({
			date: "desc",
		});
	});
});
