import { prisma } from "@/lib/prisma";
import type { Player } from "@prisma/client";

import type { FundraiserParticipantWithPlayer } from "../types";

export async function getFundraiserParticipants(
	fundraiserId: string,
): Promise<FundraiserParticipantWithPlayer[]> {
	return prisma.fundraiserParticipant.findMany({
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
}

export async function getEligibleFundraiserPlayers(
	fundraiserId: string,
): Promise<Player[]> {
	const participants = await prisma.fundraiserParticipant.findMany({
		where: {
			fundraiserId,
		},
		select: {
			playerId: true,
		},
	});

	const participantIds = participants.map(
		(participant) => participant.playerId,
	);

	return prisma.player.findMany({
		where: {
			status: true,
			id: {
				notIn: participantIds,
			},
		},
		orderBy: {
			lastName: "asc",
		},
	});
}
