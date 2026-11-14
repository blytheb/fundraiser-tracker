import { Prisma } from "@prisma/client";
import type { Pot, TeamTransactionStatus, TransactionDirection } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import type { TransactionKind } from "@/lib/labels";

// Draft / Final / Shared. Individual transactions are always Shared (parents see them right away).
export type FeedStatus = Exclude<TeamTransactionStatus, "VOIDED">;

// what the edit dialog needs for an individual transaction
export type IndividualEditData = {
	id: string;
	playerId: string;
	direction: TransactionDirection;
	pot: Pot;
	amount: number; // positive
	date: string; // YYYY-MM-DD
	description: string | null;
};

export type FeedRow = {
	key: string;
	kind: TransactionKind;
	name: string;
	who: string;
	date: Date;
	amount: number; // signed: income +, expense −
	status: FeedStatus;
	pot: Pot;
	href: string | null; // team transactions open their page
	individual?: IndividualEditData; // individual transactions open the edit dialog instead
};

export type FeedFilters = {
	kind?: TransactionKind;
	search?: string;
	teamId?: string; // only this team's team transactions (no individual rows)
	status?: FeedStatus; // e.g. only drafts
};

const zero = new Prisma.Decimal(0);

function teamSummary(teamNames: string[], playerCount: number) {
	const players = `${playerCount} ${playerCount === 1 ? "player" : "players"}`;
	return teamNames.length > 0 ? `${teamNames.join(", ")} · ${players}` : players;
}

// Every transaction an admin can see, newest first:
// - individual income/expense (player transactions not tied to a team transaction)
// - team income/expense (team transactions, any status)
// Merged in memory; fine at a club's scale.
export async function getTransactionFeed(filters: FeedFilters = {}) {
	await requireAdmin();

	const teamFilter = filters.teamId
		? { teams: { some: { teamId: filters.teamId } } }
		: {};

	const [individual, teamTransactions] = await Promise.all([
		filters.teamId
			? Promise.resolve([])
			: prisma.playerTransaction.findMany({
					where: {
						teamTransactionId: null,
						transferId: null, // moves between a player's pots aren't income or expense
						status: { not: "VOID" },
					},
					select: {
						id: true,
						amount: true,
						direction: true,
						pot: true,
						description: true,
						date: true,
						player: { select: { id: true, firstName: true, lastName: true } },
					},
				}),
		prisma.teamTransaction.findMany({
			// deleted ones are kept for history but hidden
			where: { status: { not: "VOIDED" }, ...teamFilter },
			select: {
				id: true,
				name: true,
				date: true,
				direction: true,
				pot: true,
				status: true,
				items: { select: { amount: true } },
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
				status: "PUBLISHED",
				pot: t.pot,
				href: null,
				individual: {
					id: t.id,
					playerId: t.player.id,
					direction: t.direction,
					pot: t.pot,
					amount: amount.toNumber(),
					date: t.date.toISOString().slice(0, 10),
					description: t.description,
				},
			};
		}),
		...teamTransactions.map((t): FeedRow => {
			const total = Prisma.Decimal.sum(zero, ...t.items.map((i) => i.amount));
			const isIncome = t.direction === "INCOME";
			return {
				key: `team:${t.id}`,
				kind: isIncome ? "TEAM_INCOME" : "TEAM_EXPENSE",
				name: t.name,
				who: teamSummary(
					t.teams.map((x) => x.team.name),
					t._count.participants,
				),
				date: t.date,
				amount: (isIncome ? total : total.negated()).toNumber(),
				status: t.status as FeedStatus, // VOIDED filtered out in the query
				pot: t.pot,
				href: `/admin/transactions/team/${t.id}`,
			};
		}),
	];

	const search = filters.search?.trim().toLowerCase();
	const filtered = rows
		.filter((row) => !filters.kind || row.kind === filters.kind)
		.filter((row) => !filters.status || row.status === filters.status)
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
