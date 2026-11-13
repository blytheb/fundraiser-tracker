"use server";

import type { PaymentMethod, TransactionDirection } from "@prisma/client";
import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import {
	assertTeamDraft,
	claimTeamStatus,
	parseMoney,
	writeTeamLedgerRows,
} from "@/features/transactions/lib/team-transaction";
import { parseDateInput } from "@/features/transactions/lib/dates";

export type TeamTransactionInput = {
	id?: string; // set when editing an existing draft
	name: string;
	description?: string;
	date: string; // YYYY-MM-DD
	direction: TransactionDirection;
	paymentMethod: PaymentMethod;
	total: number;
	teamIds: string[];
	shares: { playerId: string; amount: number }[];
	complete: boolean; // true = "Save & complete", false = "Save draft"
};

// Creates or updates a DRAFT team transaction: one money item (the total),
// the teams, and one share per player. Drafts may be unbalanced; completing
// requires the shares to add up to the total (checked in writeTeamLedgerRows).
export async function saveTeamTransaction(input: TeamTransactionInput) {
	return runAction(async () => {
		await requireAdmin();

		const name = input.name.trim();
		if (!name) {
			throw new Error("Enter a name.");
		}

		if (input.direction !== "INCOME" && input.direction !== "EXPENSE") {
			throw new Error("Choose income or expense.");
		}

		const date = parseDateInput(input.date);
		const total = parseMoney(input.total, "Total");

		if (input.shares.length === 0) {
			throw new Error("Add at least one player.");
		}

		const seen = new Set<string>();
		const shares = input.shares.map((share) => {
			if (seen.has(share.playerId)) {
				throw new Error("A player was added more than once.");
			}
			seen.add(share.playerId);
			return {
				playerId: share.playerId,
				amount: parseMoney(share.amount, "Each share", { allowZero: true }),
			};
		});

		const teamIds = [...new Set(input.teamIds)];
		const description = input.description?.trim() || null;

		return prisma.$transaction(async (tx) => {
			let id = input.id;

			if (id) {
				await assertTeamDraft(tx, id);

				await tx.teamTransaction.update({
					where: { id },
					data: { name, description, date, direction: input.direction },
				});

				// a draft has no ledger rows yet, so its parts can simply be replaced
				await tx.teamTransactionItem.deleteMany({ where: { teamTransactionId: id } });
				await tx.teamTransactionTeam.deleteMany({ where: { teamTransactionId: id } });
				await tx.teamTransactionParticipant.deleteMany({
					where: { teamTransactionId: id },
				});
			} else {
				const created = await tx.teamTransaction.create({
					data: { name, description, date, direction: input.direction },
					select: { id: true },
				});
				id = created.id;
			}

			await tx.teamTransactionItem.create({
				data: {
					teamTransactionId: id,
					name,
					amount: total,
					date,
					paymentMethod: input.paymentMethod,
					description,
				},
			});

			if (teamIds.length > 0) {
				await tx.teamTransactionTeam.createMany({
					data: teamIds.map((teamId) => ({ teamTransactionId: id, teamId })),
				});
			}

			// 3 queries total, however many players (the database is ~100ms away)
			await tx.teamTransactionParticipant.createMany({
				data: shares.map((share) => ({ teamTransactionId: id, playerId: share.playerId })),
			});
			const participants = await tx.teamTransactionParticipant.findMany({
				where: { teamTransactionId: id },
				select: { id: true, playerId: true },
			});
			const participantIdByPlayer = new Map(
				participants.map((p) => [p.playerId, p.id]),
			);
			await tx.teamTransactionShare.createMany({
				data: shares.map((share) => ({
					participantId: participantIdByPlayer.get(share.playerId)!,
					amount: share.amount,
				})),
			});

			if (input.complete) {
				await claimTeamStatus(tx, id, {
					from: "DRAFT",
					to: "COMPLETED",
					action: "finalized",
				});
				await writeTeamLedgerRows(tx, id);
			}

			return { id };
		}, { timeout: 15000 });
	});
}
