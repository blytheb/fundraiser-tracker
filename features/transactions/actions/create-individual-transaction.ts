"use server";

import type { TransactionDirection } from "@prisma/client";
import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { parseMoney } from "@/features/transactions/lib/team-transaction";
import { parseDateInput } from "@/features/transactions/lib/dates";

export type IndividualTransactionInput = {
	playerId: string;
	direction: TransactionDirection;
	amount: number;
	date: string; // YYYY-MM-DD from a date input
	description?: string;
};

// Individual income or expense for one player. Posted immediately (PUBLISHED),
// like v1 deposits and expenses.
export async function createIndividualTransaction(
	input: IndividualTransactionInput,
) {
	return runAction(async () => {
		await requireAdmin();

		if (input.direction !== "INCOME" && input.direction !== "EXPENSE") {
			throw new Error("Choose income or expense.");
		}

		const amount = parseMoney(input.amount, "Amount");
		const date = parseDateInput(input.date);

		const player = await prisma.player.findUnique({
			where: { id: input.playerId },
			select: { id: true },
		});

		if (!player) {
			throw new Error("Choose a player.");
		}

		const transaction = await prisma.playerTransaction.create({
			data: {
				playerId: player.id,
				direction: input.direction,
				// legacy column, still required until PlayerTransaction.type is removed
				type: input.direction === "INCOME" ? "PAYMENT" : "EXPENSE",
				amount,
				date,
				description: input.description?.trim() || null,
				status: "PUBLISHED",
			},
			select: { id: true },
		});

		return { id: transaction.id };
	});
}
