//when does the fundraiser become official
"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { claimStatus } from "@/features/fundraisers/lib/fundraiser-status";

// completed to published status: makes the fundraiser and its distributions visible to parent
export async function publishFundraiser(fundraiserId: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await claimStatus(tx, fundraiserId, { from: "COMPLETED", to: "PUBLISHED", action: "shared" });

			//any error throw below rolls the status back to completed
			const participantCount = await tx.fundraiserParticipant.count({
				where: {
					fundraiserId,
				},
			});

			if (participantCount === 0) {
				throw new Error("A fundraiser must have at least one participant");
			}

			//make fundraiser's distributions visible to parent
			await tx.playerTransaction.updateMany({
				where: {
					fundraiserId,
					status: "INTERNAL",
					type: "DISTRIBUTION",
				},
				data: {
					status: "PUBLISHED",
				},
			});
			return {
				success: true,
			};
		});
	});
}
