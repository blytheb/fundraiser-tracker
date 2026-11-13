"use server";

import type { Prisma } from "@prisma/client";
import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { parseMoney } from "@/features/transactions/lib/team-transaction";
import { parseDateInput } from "@/features/transactions/lib/dates";
import type { IndividualTransactionInput } from "@/features/transactions/actions/create-individual-transaction";

// Individual = not part of a team transaction or a v1 fundraiser, and not already deleted.
async function findEditableIndividual(tx: Prisma.TransactionClient, id: string) {
	const transaction = await tx.playerTransaction.findFirst({
		where: { id, teamTransactionId: null, fundraiserId: null },
		select: { id: true, status: true },
	});

	if (!transaction) {
		throw new Error("Transaction not found");
	}

	if (transaction.status === "VOID") {
		throw new Error("This transaction was deleted.");
	}

	return transaction;
}

export async function updateIndividualTransaction(
	id: string,
	input: IndividualTransactionInput,
) {
	return runAction(async () => {
		await requireAdmin();

		if (input.direction !== "INCOME" && input.direction !== "EXPENSE") {
			throw new Error("Choose income or expense.");
		}

		const amount = parseMoney(input.amount, "Amount");
		const date = parseDateInput(input.date);

		return prisma.$transaction(async (tx) => {
			await findEditableIndividual(tx, id);

			const player = await tx.player.findUnique({
				where: { id: input.playerId },
				select: { id: true },
			});
			if (!player) {
				throw new Error("Choose a player.");
			}

			await tx.playerTransaction.update({
				where: { id },
				data: {
					playerId: player.id,
					direction: input.direction,
					// legacy column, still required until PlayerTransaction.type is removed
					type: input.direction === "INCOME" ? "PAYMENT" : "EXPENSE",
					amount,
					date,
					description: input.description?.trim() || null,
				},
			});

			return { id };
		});
	});
}

// Removes it from lists and balances; the row is kept as VOID for history.
export async function deleteIndividualTransaction(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await findEditableIndividual(tx, id);
			await tx.playerTransaction.update({
				where: { id },
				data: { status: "VOID" },
			});
			return { id };
		});
	});
}
