import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import type { Player } from "@prisma/client";

export async function getPlayers(search?: string): Promise<Player[]> {
	await requireAdmin();
	return prisma.player.findMany({
		where: search
			? {
					OR: [
						{
							firstName: {
								contains: search,
								mode: "insensitive",
							},
						},
						{
							lastName: {
								contains: search,
								mode: "insensitive",
							},
						},
					],
				}
			: undefined,
		orderBy: [
			{
				lastName: "asc",
			},
			{
				firstName: "asc",
			},
		],
	});
}

//admin only: admins can view any player. Parent pages use getPlayerWithTeams, which checks the parent link.
export async function getPlayerById(id: string): Promise<Player | null> {
	await requireAdmin();

	return prisma.player.findUnique({
		where: {
			id,
		},
	});
}


// Active players for pickers (new team, new transaction), sorted by last name.
export async function getActivePlayerOptions() {
	await requireAdmin();

	const players = await prisma.player.findMany({
		where: { status: true },
		select: { id: true, firstName: true, lastName: true },
		orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
	});

	return players.map((p) => ({ ...p, name: `${p.firstName} ${p.lastName}` }));
}

// Admin view of a player's ledger: Shared and Final rows (Final counts toward the
// balance but parents can't see it yet). Deleted (VOID) rows are left out.
export async function getPlayerLedgerForAdmin(playerId: string) {
	await requireAdmin();

	return prisma.playerTransaction.findMany({
		where: { playerId, status: { in: ["PUBLISHED", "INTERNAL"] } },
		select: {
			id: true,
			playerId: true,
			amount: true,
			direction: true,
			description: true,
			date: true,
			status: true,
			teamTransaction: { select: { id: true, name: true } },
			fundraiser: { select: { id: true, name: true } },
		},
		orderBy: { date: "desc" },
	});
}

// Admin balances for several players at once (Shared + Final rows), as numbers.
export async function getPlayerBalances(playerIds: string[]) {
	await requireAdmin();

	const rows = await prisma.playerTransaction.findMany({
		where: { playerId: { in: playerIds }, status: { in: ["PUBLISHED", "INTERNAL"] } },
		select: { playerId: true, amount: true, direction: true },
	});

	const balances = new Map<string, Prisma.Decimal>(
		playerIds.map((id) => [id, new Prisma.Decimal(0)]),
	);
	for (const row of rows) {
		const amount = new Prisma.Decimal(row.amount).abs();
		const current = balances.get(row.playerId) ?? new Prisma.Decimal(0);
		balances.set(
			row.playerId,
			row.direction === "INCOME" ? current.plus(amount) : current.minus(amount),
		);
	}

	return new Map([...balances].map(([id, value]) => [id, value.toNumber()]));
}
