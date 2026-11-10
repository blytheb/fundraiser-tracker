import { Prisma } from "@prisma/client";
import type { PlayerTransactionType } from "@prisma/client";

// The fields the summary needs. Callers pass already-filtered transactions
// (only PUBLISHED ones count toward the balance).
export type SummaryTransaction = {
	id: string;
	amount: Prisma.Decimal | number;
	type: PlayerTransactionType;
	description: string | null;
	date: Date;
	fundraiser?: { name: string } | null;
};

const DEFAULT_TITLES: Record<PlayerTransactionType, string> = {
	DISTRIBUTION: "Fundraiser Distribution",
	PAYMENT: "Player Deposit",
	EXPENSE: "Player Expense",
	ADJUSTMENT: "Balance Adjustment",
};

const DEFAULT_DESCRIPTIONS: Record<PlayerTransactionType, string> = {
	DISTRIBUTION: "Fundraiser distribution",
	PAYMENT: "Individual deposit",
	EXPENSE: "Individual expense",
	ADJUSTMENT: "Balance adjustment",
};

// Sign of each transaction in the player's balance:
// payments and distributions add, expenses subtract, adjustments keep their own sign.
function signedAmount(type: PlayerTransactionType, amount: Prisma.Decimal) {
	switch (type) {
		case "EXPENSE":
			return amount.abs().negated();
		case "ADJUSTMENT":
			return amount;
		default:
			return amount.abs();
	}
}

// Pure function: no database, no auth. Math is done in Decimal and converted
// to numbers only in the result, so the result can be passed to client components.
export function summarizeTransactions(transactions: SummaryTransaction[]) {
	const zero = new Prisma.Decimal(0);
	let totalDeposits = zero;
	let totalDistributions = zero;
	let totalExpenses = zero;
	let positiveAdjustments = zero;
	let negativeAdjustments = zero; // stored as a positive amount

	const history = transactions.map((transaction) => {
		const amount = new Prisma.Decimal(transaction.amount);
		const signed = signedAmount(transaction.type, amount);

		switch (transaction.type) {
			case "PAYMENT":
				totalDeposits = totalDeposits.plus(signed);
				break;
			case "DISTRIBUTION":
				totalDistributions = totalDistributions.plus(signed);
				break;
			case "EXPENSE":
				totalExpenses = totalExpenses.plus(signed.abs());
				break;
			case "ADJUSTMENT":
				if (signed.isPositive()) {
					positiveAdjustments = positiveAdjustments.plus(signed);
				} else {
					negativeAdjustments = negativeAdjustments.plus(signed.abs());
				}
				break;
		}

		return {
			id: transaction.id,
			title:
				transaction.type === "DISTRIBUTION" && transaction.fundraiser
					? transaction.fundraiser.name
					: DEFAULT_TITLES[transaction.type],
			description:
				transaction.description ?? DEFAULT_DESCRIPTIONS[transaction.type],
			date: transaction.date,
			type: transaction.type,
			amount: signed.toNumber(),
		};
	});

	history.sort((a, b) => b.date.getTime() - a.date.getTime());

	const totalMoneyIn = totalDeposits
		.plus(totalDistributions)
		.plus(positiveAdjustments);
	const totalMoneyOut = totalExpenses.plus(negativeAdjustments);

	return {
		totalDeposits: totalDeposits.toNumber(),
		totalDistributions: totalDistributions.toNumber(),
		totalExpenses: totalExpenses.toNumber(),
		totalMoneyIn: totalMoneyIn.toNumber(),
		totalMoneyOut: totalMoneyOut.toNumber(),
		currentBalance: totalMoneyIn.minus(totalMoneyOut).toNumber(),
		history,
	};
}

export type PlayerFinancialSummary = ReturnType<typeof summarizeTransactions>;
