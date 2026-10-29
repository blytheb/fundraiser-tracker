//when does the fundraiser become official
"use server";

import { prisma } from "@/lib/prisma";

export async function reopenFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
		});
		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (!fundraiser.isCompleted) {
			throw new Error("Fundraiser is already in draft mode.");
		}

		await tx.playerTransaction.updateMany({
			where: {
				fundraiserId,
				status: "ACTIVE",
				type: "DISTRIBUTION",
			},
			data: {
				status: "VOID",
			},
		});

		await tx.fundraiser.update({
			where: {
				id: fundraiserId,
			},
			data: {
				isCompleted: false,
				isPublished: false,
			},
		});

		return {
			success: true,
		};
	});
}
