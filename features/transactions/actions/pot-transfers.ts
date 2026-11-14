"use server";

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { Pot } from "@prisma/client";
import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { POT_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/format";
import { parseMoney } from "@/features/transactions/lib/team-transaction";
import { parseDateInput } from "@/features/transactions/lib/dates";
import { parsePot } from "@/features/transactions/lib/pots";

export type PotTransferInput = {
	playerId: string;
	fromPot: Pot;
	toPot: Pot;
	amount: number;
	date: string; // YYYY-MM-DD
	note?: string;
};

// A player's balance in one pot (Shared + Final rows), in exact cents.
async function potBalance(tx: Prisma.TransactionClient, playerId: string, pot: Pot) {
	const rows = await tx.playerTransaction.findMany({
		where: { playerId, pot, status: { in: ["PUBLISHED", "INTERNAL"] } },
		select: { amount: true, direction: true },
	});
	return rows.reduce((sum, row) => {
		const amount = new Prisma.Decimal(row.amount).abs();
		return row.direction === "INCOME" ? sum.plus(amount) : sum.minus(amount);
	}, new Prisma.Decimal(0));
}

// Moves money between a player's pots: one row out of `fromPot`, one into `toPot`,
// sharing a transferId. The player's total and the bank don't change.
export async function createPotTransfer(input: PotTransferInput) {
	return runAction(async () => {
		await requireAdmin();

		const fromPot = parsePot(input.fromPot);
		const toPot = parsePot(input.toPot);
		if (fromPot === toPot) {
			throw new Error("Choose two different pots.");
		}
		const amount = parseMoney(input.amount, "Amount");
		const date = parseDateInput(input.date);

		return prisma.$transaction(async (tx) => {
			const player = await tx.player.findUnique({
				where: { id: input.playerId },
				select: { id: true },
			});
			if (!player) {
				throw new Error("Player not found");
			}

			// can't move more than the pot holds (a pot can go negative from expenses, not moves)
			const available = await potBalance(tx, player.id, fromPot);
			if (available.lessThan(amount)) {
				const shown = available.isNegative() ? 0 : available.toNumber();
				throw new Error(`Only ${formatCurrency(shown)} is available in ${POT_LABELS[fromPot]}.`);
			}

			const transferId = randomUUID();
			const note = input.note?.trim() || null;
			const base = {
				playerId: player.id,
				amount,
				date,
				status: "PUBLISHED" as const,
				transferId,
			};

			await tx.playerTransaction.createMany({
				data: [
					{
						...base,
						direction: "EXPENSE",
						pot: fromPot,
						description: note ?? "Moved to " + POT_LABELS[toPot],
					},
					{
						...base,
						direction: "INCOME",
						pot: toPot,
						description: note ?? "Moved from " + POT_LABELS[fromPot],
					},
				],
			});

			return { transferId };
		});
	});
}

// Undoes a move: both rows are voided (kept for history).
export async function deletePotTransfer(transferId: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			const voided = await tx.playerTransaction.updateMany({
				where: { transferId, status: { not: "VOID" } },
				data: { status: "VOID" },
			});
			if (voided.count === 0) {
				throw new Error("That move was not found or was already undone.");
			}
			return { transferId };
		});
	});
}
