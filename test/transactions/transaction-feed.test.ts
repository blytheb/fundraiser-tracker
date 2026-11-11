import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		playerTransaction: { findMany: vi.fn() },
		teamTransaction: { findMany: vi.fn() },
		fundraiser: { findMany: vi.fn() },
	},
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { getTransactionFeed } from "@/features/transactions/data/get-transaction-feed";

const dec = (v: string) => new Prisma.Decimal(v);
const day = (d: number) => new Date(`2026-11-${String(d).padStart(2, "0")}T00:00:00Z`);

beforeEach(() => {
	vi.clearAllMocks();
	prismaMock.playerTransaction.findMany.mockResolvedValue([
		{
			id: "pt1",
			amount: dec("100"),
			direction: "INCOME",
			description: null,
			date: day(2),
			player: { id: "p1", firstName: "John", lastName: "Smith" },
		},
		{
			id: "pt2",
			amount: dec("45"),
			direction: "EXPENSE",
			description: "Uniform",
			date: day(5),
			player: { id: "p2", firstName: "Jane", lastName: "Doe" },
		},
	]);
	prismaMock.teamTransaction.findMany.mockResolvedValue([
		{
			id: "tt1",
			name: "Tournament fee",
			date: day(8),
			direction: "EXPENSE",
			status: "DRAFT",
			items: [{ amount: dec("1000") }],
			teams: [{ team: { name: "U12 Boys" } }, { team: { name: "U12 Girls" } }],
			_count: { participants: 20 },
		},
	]);
	prismaMock.fundraiser.findMany.mockResolvedValue([
		{
			id: "f1",
			name: "Car wash",
			startDate: day(6),
			status: "PUBLISHED",
			contributions: [{ amount: dec("500") }, { amount: dec("340") }],
			teams: [{ team: { name: "U12 Boys" } }],
			_count: { participants: 12 },
		},
	]);
});

describe("getTransactionFeed", () => {
	it("merges all sources newest first with signed amounts", async () => {
		const { rows } = await getTransactionFeed();

		expect(rows.map((r) => [r.kind, r.name, r.amount, r.status])).toEqual([
			["TEAM_EXPENSE", "Tournament fee", -1000, "DRAFT"],
			["TEAM_INCOME", "Car wash", 840, "PUBLISHED"],
			["INDIVIDUAL_EXPENSE", "Uniform", -45, "POSTED"],
			["INDIVIDUAL_INCOME", "Deposit", 100, "POSTED"],
		]);
		expect(rows[0].who).toBe("U12 Boys, U12 Girls · 20 players");
		expect(rows[3].who).toBe("John Smith");
	});

	it("links each row to its page", async () => {
		const { rows } = await getTransactionFeed();
		expect(rows.map((r) => r.href)).toEqual([
			"/admin/transactions/team/tt1",
			"/admin/fundraisers/f1",
			"/admin/players/p2",
			"/admin/players/p1",
		]);
	});

	it("only loads individual rows that aren't part of a team transaction or fundraiser", async () => {
		await getTransactionFeed();
		expect(prismaMock.playerTransaction.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { teamTransactionId: null, fundraiserId: null, status: { not: "VOID" } },
			}),
		);
	});

	it("totals exclude drafts", async () => {
		const { totals } = await getTransactionFeed();
		expect(totals).toEqual({ income: 940, expenses: 45, net: 895 });
	});

	it("filters by kind and search", async () => {
		expect((await getTransactionFeed({ kind: "TEAM_INCOME" })).rows.map((r) => r.name)).toEqual([
			"Car wash",
		]);
		expect((await getTransactionFeed({ search: "u12" })).rows.map((r) => r.name)).toEqual([
			"Tournament fee",
			"Car wash",
		]);
		expect((await getTransactionFeed({ search: "jane" })).rows.map((r) => r.name)).toEqual([
			"Uniform",
		]);
	});
});
