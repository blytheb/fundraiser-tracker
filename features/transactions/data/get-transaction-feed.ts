import { Prisma } from "@prisma/client";
import type { TeamTransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import type { TransactionKind } from "@/lib/labels";

export type FeedStatus = "POSTED" | TeamTransactionStatus;

export type FeedRow = {
	key: string;
	kind: TransactionKind;
	name: string;
	who: string;
	date: Date;
	amount: number; // signed: income +, expense −
	status: FeedStatus;
	href: string | null;
};

export type FeedFilters = {
	kind?: TransactionKind;
	search?: string;
};

const zero = new Prisma.Decimal(0);

function teamSummary(teamNames: string[], playerCount: number) {
	const players = `${playerCount} ${playerCount === 1 ? "player" : "players"}`;
	return teamNames.length > 0 ? `${teamNames.join(", ")} · ${players}` : players;
}

// Every transaction an admin can see, newest first:
// - individual income/expense (player transactions not tied to a team transaction or fundraiser)
// - team income/expense (team transactions, any status)
// - v1 fundraisers, shown as team income until they're moved to team transactions
// Merged in memory; fine at a club's scale.
export async function getTransactionFeed(filters: FeedFilters = {}) {
	await requireAdmin();

	const [individual, teamTransactions, fundraisers] = await Promise.all([
		prisma.playerTransaction.findMany({
			where: {
				teamTransactionId: null,
				fundraiserId: null,
				status: { not: "VOID" },
			},
			select: {
				id: true,
				amount: true,
				direction: true,
				description: true,
				date: true,
				player: { select: { id: true, firstName: true, lastName: true } },
			},
		}),
		prisma.teamTransaction.findMany({
			select: {
				id: true,
				name: true,
				date: true,
				direction: true,
				status: true,
				items: { select: { amount: true } },
				teams: { select: { team: { select: { name: true } } } },
				_count: { select: { participants: true } },
			},
		}),
		prisma.fundraiser.findMany({
			select: {
				id: true,
				name: true,
				startDate: true,
				status: true,
				contributions: { select: { amount: true } },
				teams: { select: { team: { select: { name: true } } } },
				_count: { select: { participants: true } },
			},
		}),
	]);

	const rows: FeedRow[] = [
		...individual.map((t): FeedRow => {
			const amount = new Prisma.Decimal(t.amount).abs();
			const isIncome = t.direction === "INCOME";
			return {
				key: `individual:${t.id}`,
				kind: isIncome ? "INDIVIDUAL_INCOME" : "INDIVIDUAL_EXPENSE",
				name: t.description || (isIncome ? "Deposit" : "Expense"),
				who: `${t.player.firstName} ${t.player.lastName}`,
				date: t.date,
				amount: (isIncome ? amount : amount.negated()).toNumber(),
				status: "POSTED",
				href: `/admin/players/${t.player.id}`,
			};
		}),
		...teamTransactions.map((t): FeedRow => {
			const total = Prisma.Decimal.sum(zero, ...t.items.map((i) => i.amount));
			const isIncome = t.direction === "INCOME";
			return {
				key: `team:${t.id}`,
				kind: isIncome ? "TEAM_INCOME" : "TEAM_EXPENSE",
				name: t.name,
				who: teamSummary(t.teams.map((x) => x.team.name), t._count.participants),
				date: t.date,
				amount: (isIncome ? total : total.negated()).toNumber(),
				status: t.status,
				href: `/admin/transactions/team/${t.id}`,
			};
		}),
		...fundraisers.map((f): FeedRow => ({
			key: `fundraiser:${f.id}`,
			kind: "TEAM_INCOME",
			name: f.name,
			who: teamSummary(f.teams.map((x) => x.team.name), f._count.participants),
			date: f.startDate,
			amount: Prisma.Decimal.sum(zero, ...f.contributions.map((c) => c.amount)).toNumber(),
			status: f.status,
			href: `/admin/fundraisers/${f.id}`,
		})),
	];

	const search = filters.search?.trim().toLowerCase();
	const filtered = rows
		.filter((row) => !filters.kind || row.kind === filters.kind)
		.filter(
			(row) =>
				!search ||
				row.name.toLowerCase().includes(search) ||
				row.who.toLowerCase().includes(search),
		)
		.sort((a, b) => b.date.getTime() - a.date.getTime());

	// Totals count only money that's final (drafts excluded), done in Decimal
	let income = zero;
	let expenses = zero;
	for (const row of filtered) {
		if (row.status === "DRAFT") continue;
		const amount = new Prisma.Decimal(row.amount);
		if (amount.isNegative()) expenses = expenses.plus(amount.abs());
		else income = income.plus(amount);
	}

	return {
		rows: filtered,
		totals: {
			income: income.toNumber(),
			expenses: expenses.toNumber(),
			net: income.minus(expenses).toNumber(),
		},
	};
}
