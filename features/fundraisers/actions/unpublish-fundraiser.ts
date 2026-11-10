"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

// published to completed status: hides the fundraiser and its distributions from parent, amounts untouched
export async function unpublishFundraiser(fundraiserId: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			const claimed = await tx.fundraiser.updateMany({
				where: {
					id: fundraiserId,
					status: "PUBLISHED",
				},
				data: {
					status: "COMPLETED",
				},
			});

			if (claimed.count === 0) {
				const fundraiser = await tx.fundraiser.findUnique({
					where: {
						id: fundraiserId,
					},
					select: {
						id: true,
					},
				});
				throw new Error(
					fundraiser
						? `Fundraiser is not in PUBLISHED status`
						: "Fundraiser not found",
				);
			}

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
