"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function reopenFundraiser(fundraiserId: string) {
	await requireAdmin();

	return prisma.$transaction(async (tx) => {
		// claim the status changefirst so two reopens cant race eachother.

		const claimed = await tx.fundraiser.updateMany({
			where: {
				id: fundraiserId,
				status: { in: ["COMPLETED", "PUBLISHED"] },
			},
			data: {
				status: "DRAFT",
			},
		});

		if (claimed.count === 0) {
			const fundraiser = await tx.fundraiser.findUnique({
				where: {
					id: fundraiserId,
				},
				select: {
					id: true,
					status: true,
				},
			});
			throw new Error(
				fundraiser
					? `Fundraiser is already in ${fundraiser.status.toLowerCase()} mode`
					: "Fundraiser not found",
			);
		}

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
}
