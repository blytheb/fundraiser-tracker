import { prisma } from "@/lib/prisma";

import type { FundraiserParticipantWithPlayerSerialized } from "../types";

export async function getFundraiserParticipants(
	fundraiserId: string,
): Promise<FundraiserParticipantWithPlayerSerialized[]> {
	const participants = await prisma.fundraiserParticipant.findMany({
		where: {
			fundraiserId,
		},
		include: {
			player: true,
		},
		orderBy: {
			player: {
				lastName: "asc",
			},
		},
	});
	return participants.map((participant) => ({
		...participant,
		allocatedAmount: Number(participant.allocatedAmount),
	}));
}
