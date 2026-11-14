import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { getTransactionFeed } from "@/features/transactions/data/get-transaction-feed";

const RECENT_COUNT = 8;
const OWING_COUNT = 5;

// Everything the admin dashboard shows. Money comes from the player ledger
// (Shared + Final rows): its net is what the bank should be holding for players.
export async function getAdminDashboard() {
	await requireAdmin();

	const [
		activePlayerCount,
		inSeasonTeamCount,
		pendingAccessRequestCount,
		draftCount,
		finalNotSharedCount,
		ledger,
		feed,
	] = await Promise.all([
		prisma.player.count({ where: { status: true } }),
		prisma.team.count({ where: { status: "IN_SEASON" } }),
		prisma.playerAccessRequest.count({ where: { status: "PENDING" } }),
		prisma.teamTransaction.count({ where: { status: "DRAFT" } }),
		prisma.teamTransaction.count({ where: { status: "COMPLETED" } }),
		prisma.playerTransaction.findMany({
			where: { status: { in: ["PUBLISHED", "INTERNAL"] } },
			select: {
				playerId: true,
				amount: true,
				direction: true,
				player: { select: { firstName: true, lastName: true } },
			},
		}),
		getTransactionFeed(),
	]);

	const zero = new Prisma.Decimal(0);
	let income = zero;
	let expenses = zero;
	const byPlayer = new Map<string, { name: string; balance: Prisma.Decimal }>();

	for (const row of ledger) {
		const amount = new Prisma.Decimal(row.amount).abs();
		const isIncome = row.direction === "INCOME";
		if (isIncome) income = income.plus(amount);
		else expenses = expenses.plus(amount);

		const current = byPlayer.get(row.playerId) ?? {
			name: `${row.player.firstName} ${row.player.lastName}`,
			balance: zero,
		};
		current.balance = isIncome ? current.balance.plus(amount) : current.balance.minus(amount);
		byPlayer.set(row.playerId, current);
	}

	const negative = [...byPlayer.entries()]
		.filter(([, p]) => p.balance.isNegative())
		.sort(([, a], [, b]) => a.balance.comparedTo(b.balance));

	return {
		activePlayerCount,
		inSeasonTeamCount,
		pendingAccessRequestCount,
		draftCount,
		finalNotSharedCount,
		money: {
			income: income.toNumber(),
			expenses: expenses.toNumber(),
			heldForPlayers: income.minus(expenses).toNumber(),
		},
		negativeBalanceCount: negative.length,
		mostNegative: negative.slice(0, OWING_COUNT).map(([id, p]) => ({
			id,
			name: p.name,
			balance: p.balance.toNumber(),
		})),
		recent: feed.rows.slice(0, RECENT_COUNT),
	};
}
