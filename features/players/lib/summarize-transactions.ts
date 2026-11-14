import { Prisma } from "@prisma/client";
import type { Pot, TransactionDirection, TransactionStatus } from "@prisma/client";
import { POTS, POT_LABELS, type TransactionKind } from "@/lib/labels";

// The fields the summary needs. Callers pass already-filtered transactions:
// the parent page passes PUBLISHED rows; the admin page also passes INTERNAL
// (Final) rows, which count but aren't shared with parents yet.
export type SummaryTransaction = {
	id: string;
	playerId?: string;
	status?: TransactionStatus; // omitted = PUBLISHED
	amount: Prisma.Decimal | number; // stored positive; direction gives the sign
	direction: TransactionDirection;
	pot?: Pot; // omitted = GENERAL
	transferId?: string | null; // set on both rows of a move between pots
	description: string | null;
	date: Date;
	// set when the row is a player's share of a team transaction
	teamTransaction?: { id?: string; name: string } | null;
};

// the four kinds of the admin transactions list, plus moves between pots
export type HistoryKind = TransactionKind | "TRANSFER";

const DEFAULT_TITLES: Record<HistoryKind, string> = {
	INDIVIDUAL_INCOME: "Player Deposit",
	INDIVIDUAL_EXPENSE: "Player Expense",
	TEAM_INCOME: "Team Income",
	TEAM_EXPENSE: "Team Expense",
	TRANSFER: "Moved between pots",
};

const DEFAULT_DESCRIPTIONS: Record<HistoryKind, string> = {
	INDIVIDUAL_INCOME: "Individual deposit",
	INDIVIDUAL_EXPENSE: "Individual expense",
	TEAM_INCOME: "Share of team income",
	TEAM_EXPENSE: "Share of team expense",
	TRANSFER: "",
};

function kindOf(transaction: SummaryTransaction): HistoryKind {
	if (transaction.transferId) return "TRANSFER";
	const isTeam = Boolean(transaction.teamTransaction);
	if (transaction.direction === "INCOME") {
		return isTeam ? "TEAM_INCOME" : "INDIVIDUAL_INCOME";
	}
	return isTeam ? "TEAM_EXPENSE" : "INDIVIDUAL_EXPENSE";
}

type PotTotals = {
	fundraiser: Prisma.Decimal; // team income into this pot
	deposits: Prisma.Decimal; // individual income into this pot
	spent: Prisma.Decimal; // individual + team expenses from this pot
	movedIn: Prisma.Decimal;
	movedOut: Prisma.Decimal;
};

// Pure function: no database, no auth. Income adds, expense subtracts.
// Math is done in Decimal and converted to numbers only in the result,
// so the result can be passed to client components.
export function summarizeTransactions(transactions: SummaryTransaction[]) {
	const zero = new Prisma.Decimal(0);
	const totals: Record<TransactionKind, Prisma.Decimal> = {
		INDIVIDUAL_INCOME: zero,
		INDIVIDUAL_EXPENSE: zero,
		TEAM_INCOME: zero,
		TEAM_EXPENSE: zero,
	};
	const pots = Object.fromEntries(
		POTS.map((pot) => [
			pot,
			{ fundraiser: zero, deposits: zero, spent: zero, movedIn: zero, movedOut: zero },
		]),
	) as Record<Pot, PotTotals>;

	let notYetShared = zero; // net of Final rows parents can't see yet

	const history = transactions.map((transaction) => {
		const kind = kindOf(transaction);
		const pot = transaction.pot ?? "GENERAL";
		// abs() so a legacy row stored with a negative amount still counts once, in its direction
		const amount = new Prisma.Decimal(transaction.amount).abs();
		const signed = transaction.direction === "INCOME" ? amount : amount.negated();
		const p = pots[pot];

		if (kind === "TRANSFER") {
			// moves change pots, not the player's total, so they're not money in or out
			if (transaction.direction === "INCOME") p.movedIn = p.movedIn.plus(amount);
			else p.movedOut = p.movedOut.plus(amount);
		} else {
			totals[kind] = totals[kind].plus(amount);
			if (kind === "TEAM_INCOME") p.fundraiser = p.fundraiser.plus(amount);
			else if (kind === "INDIVIDUAL_INCOME") p.deposits = p.deposits.plus(amount);
			else p.spent = p.spent.plus(amount);
		}

		const shared = transaction.status !== "INTERNAL";
		if (!shared) notYetShared = notYetShared.plus(signed);

		return {
			id: transaction.id,
			playerId: transaction.playerId,
			kind,
			direction: transaction.direction,
			pot,
			transferId: transaction.transferId ?? null,
			shared,
			teamTransactionId: transaction.teamTransaction?.id ?? null,
			note: transaction.description, // raw note, for the edit dialog
			title:
				transaction.teamTransaction?.name ??
				(kind === "TRANSFER"
					? transaction.direction === "INCOME"
						? `Moved into ${POT_LABELS[pot]}`
						: `Moved out of ${POT_LABELS[pot]}`
					: DEFAULT_TITLES[kind]),
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
		// balance per pot; a negative balance is money due in that pot
		pots: POTS.map((pot) => {
			const t = pots[pot];
			const balance = t.fundraiser
				.plus(t.deposits)
				.plus(t.movedIn)
				.minus(t.spent)
				.minus(t.movedOut);
			return {
				pot,
				label: POT_LABELS[pot],
				balance: balance.toNumber(),
				fundraiser: t.fundraiser.toNumber(),
				deposits: t.deposits.toNumber(),
				spent: t.spent.toNumber(),
				movedIn: t.movedIn.toNumber(),
				movedOut: t.movedOut.toNumber(),
			};
		}),
		history,
	};
}

export type PlayerFinancialSummary = ReturnType<typeof summarizeTransactions>;
export type PotSummary = PlayerFinancialSummary["pots"][number];
