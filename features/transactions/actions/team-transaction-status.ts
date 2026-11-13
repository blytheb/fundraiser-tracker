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
				action: "finalized",
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
				action: "shared",
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
				action: "hidden from parents",
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

// Delete. A draft that never counted is removed for real. Anything that has
// counted (now or before) is marked VOIDED and its ledger rows voided: it
// disappears from lists and balances but stays in the database for history.
export async function deleteTeamTransaction(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			const current = await tx.teamTransaction.findUnique({
				where: { id },
				select: { status: true, _count: { select: { playerTransactions: true } } },
			});

			if (!current) {
				throw new Error("Team transaction not found");
			}

			if (current.status === "VOIDED") {
				throw new Error("This team transaction was already deleted.");
			}

			if (current.status === "DRAFT" && current._count.playerTransactions === 0) {
				await assertTeamDraft(tx, id, "deleted"); // locks it; fails if it changed meanwhile
				await tx.teamTransaction.delete({ where: { id } });
				return { id, removed: true };
			}

			await claimTeamStatus(tx, id, {
				from: ["DRAFT", "COMPLETED", "PUBLISHED"],
				to: "VOIDED",
				action: "deleted",
			});
			await tx.playerTransaction.updateMany({
				where: { teamTransactionId: id, status: { in: ["INTERNAL", "PUBLISHED"] } },
				data: { status: "VOID" },
			});
			return { id, removed: false };
		});
	});
}
