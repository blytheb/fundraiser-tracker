"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { claimStatus } from "@/features/fundraisers/lib/fundraiser-status";

export async function reopenFundraiser(fundraiserId: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			// claim the status change first so two reopens can't race each other
			await claimStatus(tx, fundraiserId, {
				from: ["COMPLETED", "PUBLISHED"],
				to: "DRAFT",
				action: "reopened",
			});

			//void distributions whether they were internal or already visable to parent.
			// This is because the fundraiser is being reopened and the distributions are no longer valid.
			await tx.playerTransaction.updateMany({
				where: {
					fundraiserId,
					status: { in: ["INTERNAL", "PUBLISHED"] },
					type: "DISTRIBUTION",
				},
				data: {
					status: "VOID",
				},
			});

			return {
				success: true,
			};
		});
	});
}
