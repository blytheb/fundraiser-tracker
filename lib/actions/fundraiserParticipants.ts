"use server";

import { prisma } from "@/lib/prisma";

export async function addPlayerToFundraiser(
	fundraiserId: string,
	playerId: string,
) {
	return prisma.fundraiserParticipant.create({
		data: {
			fundraiserId,
			playerId,
		},
	});
}

export async function removePlayerFromFundraiser(
	fundraiserId: string,
	playerId: string,
) {
	return prisma.fundraiserParticipant.delete({
		where: {
			fundraiserId_playerId: {
				fundraiserId,
				playerId,
			},
		},
	});
}

export async function saveFundraiserParticipant(
	fundraiserId: string,
	playerIds: string[],
) {
	await prisma.fundraiserTeam.deleteMany({
		where: {
			fundraiserId,
		},
	});

	if (playerIds.length > 0) {
		await prisma.fundraiserTeam.createMany({
			data: playerIds.map((playerId) => ({
				fundraiserId,
				playerId,
			})),
		});
	}
}
