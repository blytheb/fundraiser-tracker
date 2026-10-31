"use server";

import { prisma } from "@/lib/prisma";

export async function reopenFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
			select: {
				status: true,
			},
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.status === "DRAFT") {
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
				status: "DRAFT",
			},
		});

		return {
			success: true,
		};
	});
}
