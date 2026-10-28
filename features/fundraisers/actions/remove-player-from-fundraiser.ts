"use server";

import { prisma } from "@/lib/prisma";

export async function removePlayerFromFundraiser(
	fundraiserId: string,
	playerId: string,
) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: { id: fundraiserId },
		select: { isCompleted: true },
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (fundraiser.isCompleted) {
		throw new Error("Completed fundraisers cannot be edited.");
	}

	return prisma.fundraiserParticipant.delete({
		where: {
			fundraiserId_playerId: {
				fundraiserId,
				playerId,
			},
		},
	});
}
