import { Prisma } from "@prisma/client";
import type { TransactionDirection, TransactionStatus } from "@prisma/client";
import type { TransactionKind } from "@/lib/labels";

// The fields the summary needs. Callers pass already-filtered transactions:
// the parent page passes PUBLISHED rows; the admin page also passes INTERNAL
// (Final) rows, which count but aren't shared with parents yet.
export type SummaryTransaction = {
	id: string;
	playerId?: string;
	status?: TransactionStatus; // omitted = PUBLISHED
	amount: Prisma.Decimal | number; // stored positive; direction gives the sign
	direction: TransactionDirection;
	description: string | null;
	date: Date;
	// set when the row is a player's share of a team transaction
	teamTransaction?: { id?: string; name: string } | null;
};

// same four kinds as the admin transactions list
export type HistoryKind = TransactionKind;

const DEFAULT_TITLES: Record<HistoryKind, string> = {
	INDIVIDUAL_INCOME: "Player Deposit",
	INDIVIDUAL_EXPENSE: "Player Expense",
	TEAM_INCOME: "Team Income",
	TEAM_EXPENSE: "Team Expense",
};

const DEFAULT_DESCRIPTIONS: Record<HistoryKind, string> = {
	INDIVIDUAL_INCOME: "Individual deposit",
	INDIVIDUAL_EXPENSE: "Individual expense",
	TEAM_INCOME: "Share of team income",
	TEAM_EXPENSE: "Share of team expense",
};

function kindOf(transaction: SummaryTransaction): HistoryKind {
	const isTeam = Boolean(transaction.teamTransaction);
	if (transaction.direction === "INCOME") {
		return isTeam ? "TEAM_INCOME" : "INDIVIDUAL_INCOME";
	}
	return isTeam ? "TEAM_EXPENSE" : "INDIVIDUAL_EXPENSE";
}

// Pure function: no database, no auth. Income adds, expense subtracts.
// Math is done in Decimal and converted to numbers only in the result,
// so the result can be passed to client components.
export function summarizeTransactions(transactions: SummaryTransaction[]) {
	const zero = new Prisma.Decimal(0);
	const totals: Record<HistoryKind, Prisma.Decimal> = {
		INDIVIDUAL_INCOME: zero,
		INDIVIDUAL_EXPENSE: zero,
		TEAM_INCOME: zero,
		TEAM_EXPENSE: zero,
	};

	let notYetShared = zero; // net of Final rows parents can't see yet

	const history = transactions.map((transaction) => {
		const kind = kindOf(transaction);
		// abs() so a legacy row stored with a negative amount still counts once, in its direction
		const amount = new Prisma.Decimal(transaction.amount).abs();
		const signed = transaction.direction === "INCOME" ? amount : amount.negated();
		totals[kind] = totals[kind].plus(amount);

		const shared = transaction.status !== "INTERNAL";
		if (!shared) notYetShared = notYetShared.plus(signed);

		return {
			id: transaction.id,
			playerId: transaction.playerId,
			kind,
			direction: transaction.direction,
			shared,
			teamTransactionId: transaction.teamTransaction?.id ?? null,
			note: transaction.description, // raw note, for the edit dialog
			title:
				transaction.teamTransaction?.name ??
				DEFAULT_TITLES[kind],
			description: transaction.description ?? DEFAULT_DESCRIPTIONS[kind],
			date: transaction.date,
			amount: signed.toNumber(),
		};
	});

	history.sort((a, b) => b.date.getTime() - a.date.getTime());

	const totalMoneyIn = totals.INDIVIDUAL_INCOME.plus(totals.TEAM_INCOME);
	const totalMoneyOut = totals.INDIVIDUAL_EXPENSE.plus(totals.TEAM_EXPENSE);

	return {
		individualIncome: totals.INDIVIDUAL_INCOME.toNumber(),
		individualExpenses: totals.INDIVIDUAL_EXPENSE.toNumber(),
		teamIncome: totals.TEAM_INCOME.toNumber(),
		teamExpenses: totals.TEAM_EXPENSE.toNumber(),
		totalMoneyIn: totalMoneyIn.toNumber(),
		totalMoneyOut: totalMoneyOut.toNumber(),
		currentBalance: totalMoneyIn.minus(totalMoneyOut).toNumber(),
		notYetShared: notYetShared.toNumber(),
		history,
	};
}

export type PlayerFinancialSummary = ReturnType<typeof summarizeTransactions>;
