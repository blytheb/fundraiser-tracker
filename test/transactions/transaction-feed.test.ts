import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		playerTransaction: { findMany: vi.fn() },
		teamTransaction: { findMany: vi.fn() },
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
		{
			id: "tt2",
			name: "Car wash",
			date: day(6),
			direction: "INCOME",
			status: "PUBLISHED",
			items: [{ amount: dec("500") }, { amount: dec("340") }],
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
			["INDIVIDUAL_EXPENSE", "Uniform", -45, "PUBLISHED"],
			["INDIVIDUAL_INCOME", "Deposit", 100, "PUBLISHED"],
		]);
		expect(rows[0].who).toBe("U12 Boys, U12 Girls · 20 players");
		expect(rows[3].who).toBe("John Smith");
	});

	it("links team rows to their page; individual rows open the edit dialog", async () => {
		const { rows } = await getTransactionFeed();
		expect(rows.map((r) => r.href)).toEqual([
			"/admin/transactions/team/tt1",
			"/admin/transactions/team/tt2",
			null,
			null,
		]);
		expect(rows[2].individual).toEqual({
			id: "pt2",
			playerId: "p2",
			direction: "EXPENSE",
			amount: 45,
			date: "2026-11-05",
			description: "Uniform",
		});
	});

	it("hides deleted team transactions", async () => {
		await getTransactionFeed();
		expect(prismaMock.teamTransaction.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { status: { not: "VOIDED" } } }),
		);
	});

	it("only loads individual rows that aren't part of a team transaction", async () => {
		await getTransactionFeed();
		expect(prismaMock.playerTransaction.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { teamTransactionId: null, transferId: null, status: { not: "VOID" } },
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
