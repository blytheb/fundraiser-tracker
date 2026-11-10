//when does the fundraiser become official
"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

// completed to published status: makes the fundraiser and its distributions visible to parent
export async function publishFundraiser(fundraiserId: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			const claimed = await tx.fundraiser.updateMany({
				where: {
					id: fundraiserId,
					status: "COMPLETED",
				},
				data: {
					status: "PUBLISHED",
				},
			});

			if (claimed.count === 0) {
				const fundraiser = await tx.fundraiser.findUnique({
					where: {
						id: fundraiserId,
					},
					select: {
						status: true,
						_count: {
							select: {
								participants: true,
							},
						},
					},
				});
				if (!fundraiser) {
					throw new Error("Fundraiser not found");
				}

				if (fundraiser.status === "PUBLISHED") {
					throw new Error("Fundraiser is already published");
				}

				throw new Error(
					`Fundraiser must be completed before it can be published. Current status: ${fundraiser.status}`,
				);
			}

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
