"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function addPlayerToFundraiser(
	fundraiserId: string,
	playerId: string,
) {
	return runAction(async () => {
		await requireAdmin();

		const fundraiser = await prisma.fundraiser.findUnique({
			where: { id: fundraiserId },
			select: { status: true },
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.status !== "DRAFT") {
			throw new Error("Completed fundraisers cannot be edited.");
		}

		return prisma.fundraiserParticipant.create({
			data: {
				fundraiserId,
				playerId,
				//every participant starts with a $0 allocation
				allocations: {
					create: { amount: 0, status: "ACTIVE" },
				},
			},
		});
	});
}
