"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { claimStatus } from "@/features/fundraisers/lib/fundraiser-status";

// published to completed status: hides the fundraiser and its distributions from parent, amounts untouched
export async function unpublishFundraiser(fundraiserId: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await claimStatus(tx, fundraiserId, { from: "PUBLISHED", to: "COMPLETED", action: "unpublished" });

			await tx.playerTransaction.updateMany({
				where: {
					fundraiserId,
					status: "PUBLISHED",
					type: "DISTRIBUTION",
				},
				data: {
					status: "INTERNAL",
				},
			});

			return {
				success: true,
			};
		});
	});
}
