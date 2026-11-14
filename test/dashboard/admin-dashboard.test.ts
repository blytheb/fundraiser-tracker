import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		player: { count: vi.fn() },
		team: { count: vi.fn() },
		playerAccessRequest: { count: vi.fn() },
		teamTransaction: { count: vi.fn(), findMany: vi.fn() },
		playerTransaction: { findMany: vi.fn() },
		fundraiser: { findMany: vi.fn() },
	},
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { getAdminDashboard } from "@/features/dashboard/data/get-admin-dashboard";

const dec = (v: string) => new Prisma.Decimal(v);
const row = (playerId: string, name: string, amount: string, direction: "INCOME" | "EXPENSE") => ({
	playerId,
	amount: dec(amount),
	direction,
	player: { firstName: name, lastName: "X" },
});

beforeEach(() => {
	vi.clearAllMocks();
	prismaMock.player.count.mockResolvedValue(12);
	prismaMock.team.count.mockResolvedValue(2);
	prismaMock.playerAccessRequest.count.mockResolvedValue(1);
	prismaMock.teamTransaction.count.mockResolvedValueOnce(3).mockResolvedValueOnce(4);
	prismaMock.teamTransaction.findMany.mockResolvedValue([]);
	prismaMock.fundraiser.findMany.mockResolvedValue([]);
	prismaMock.playerTransaction.findMany.mockImplementation(async (args) =>
		// the ledger query selects player names; the feed's individual query selects description
		args.select?.player?.select?.firstName && !args.select?.description
			? [
					row("p1", "Ana", "100", "INCOME"),
					row("p1", "Ana", "30", "EXPENSE"),
					row("p2", "Ben", "50", "EXPENSE"),
					row("p3", "Cy", "0.1", "INCOME"),
					row("p3", "Cy", "0.3", "EXPENSE"),
				]
			: [],
	);
});

describe("getAdminDashboard", () => {
	it("totals the ledger exactly; held for players = income − expenses", async () => {
		const data = await getAdminDashboard();
		expect(data.money).toEqual({ income: 100.1, expenses: 80.3, heldForPlayers: 19.8 });
	});

	it("lists players below zero, most negative first", async () => {
		const data = await getAdminDashboard();
		expect(data.negativeBalanceCount).toBe(2);
		expect(data.mostNegative).toEqual([
			{ id: "p2", name: "Ben X", balance: -50 },
			{ id: "p3", name: "Cy X", balance: -0.2 },
		]);
	});

	it("reports counts for needs-attention and doesn't load fundraisers", async () => {
		const data = await getAdminDashboard();
		expect(data).toMatchObject({
			activePlayerCount: 12,
			inSeasonTeamCount: 2,
			pendingAccessRequestCount: 1,
			draftCount: 3,
			finalNotSharedCount: 4,
		});
		expect(prismaMock.fundraiser.findMany).not.toHaveBeenCalled();
		expect(prismaMock.playerTransaction.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { status: { in: ["PUBLISHED", "INTERNAL"] } } }),
		);
	});
});
