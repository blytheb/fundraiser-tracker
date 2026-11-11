import { Prisma } from "@prisma/client";
import type { TransactionDirection } from "@prisma/client";
import type { TransactionKind } from "@/lib/labels";

// The fields the summary needs. Callers pass already-filtered transactions
// (only PUBLISHED ones count toward the balance).
export type SummaryTransaction = {
	id: string;
	amount: Prisma.Decimal | number; // stored positive; direction gives the sign
	direction: TransactionDirection;
	description: string | null;
	date: Date;
	// set when the row is a player's share of a team transaction
	teamTransaction?: { name: string } | null;
	// v1 fundraiser link, kept while fundraisers move to team transactions
	fundraiser?: { name: string } | null;
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
	const isTeam = Boolean(transaction.teamTransaction || transaction.fundraiser);
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

	const history = transactions.map((transaction) => {
		const kind = kindOf(transaction);
		// abs() so a legacy row stored with a negative amount still counts once, in its direction
		const amount = new Prisma.Decimal(transaction.amount).abs();
		totals[kind] = totals[kind].plus(amount);

		return {
			id: transaction.id,
			kind,
			direction: transaction.direction,
			title:
				transaction.teamTransaction?.name ??
				transaction.fundraiser?.name ??
				DEFAULT_TITLES[kind],
			description: transaction.description ?? DEFAULT_DESCRIPTIONS[kind],
			date: transaction.date,
			amount: (transaction.direction === "INCOME"
				? amount
				: amount.negated()
			).toNumber(),
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
		history,
	};
}

export type PlayerFinancialSummary = ReturnType<typeof summarizeTransactions>;
