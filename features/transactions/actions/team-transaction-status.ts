"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import {
	assertTeamDraft,
	claimTeamStatus,
	writeTeamLedgerRows,
} from "@/features/transactions/lib/team-transaction";

// Draft → Completed: locks the numbers and writes INTERNAL ledger rows (admins only).
export async function completeTeamTransaction(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await claimTeamStatus(tx, id, {
				from: "DRAFT",
				to: "COMPLETED",
				action: "completed",
			});
			await writeTeamLedgerRows(tx, id); // throwing here rolls back to DRAFT
			return { id };
		});
	});
}

// Completed → Published: parents can now see each player's share.
export async function publishTeamTransaction(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await claimTeamStatus(tx, id, {
				from: "COMPLETED",
				to: "PUBLISHED",
				action: "published",
			});
			await tx.playerTransaction.updateMany({
				where: { teamTransactionId: id, status: "INTERNAL" },
				data: { status: "PUBLISHED" },
			});
			return { id };
		});
	});
}

// Published → Completed: hides the shares from parents again; amounts unchanged.
export async function unpublishTeamTransaction(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await claimTeamStatus(tx, id, {
				from: "PUBLISHED",
				to: "COMPLETED",
				action: "unpublished",
			});
			await tx.playerTransaction.updateMany({
				where: { teamTransactionId: id, status: "PUBLISHED" },
				data: { status: "INTERNAL" },
			});
			return { id };
		});
	});
}

// Completed/Published → Draft: voids the ledger rows (kept for history) so it can be edited.
export async function reopenTeamTransaction(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await claimTeamStatus(tx, id, {
				from: ["COMPLETED", "PUBLISHED"],
				to: "DRAFT",
				action: "reopened",
			});
			await tx.playerTransaction.updateMany({
				where: { teamTransactionId: id, status: { in: ["INTERNAL", "PUBLISHED"] } },
				data: { status: "VOID" },
			});
			return { id };
		});
	});
}

// Deletes a draft that has never been completed. One with voided history is kept.
export async function deleteTeamTransaction(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await assertTeamDraft(tx, id, "deleted");

			const history = await tx.playerTransaction.count({
				where: { teamTransactionId: id },
			});
			if (history > 0) {
				throw new Error(
					"This team transaction was completed before, so its history is kept. Edit it instead of deleting it.",
				);
			}

			await tx.teamTransaction.delete({ where: { id } });
			return { id };
		});
	});
}
