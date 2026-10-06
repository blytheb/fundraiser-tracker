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

export async function saveFundraiserParticipants(
	fundraiserId: string,
	playerIds: string[],
) {
	return prisma.$transaction(async (tx) => {
		//remove players who are no longer selected
		await tx.fundraiserParticipant.deleteMany({
			where: {
				fundraiserId,
				playerId: {
					notIn: playerIds,
				},
			},
		});

		//add newly selected players
		if (playerIds.length > 0) {
			await tx.fundraiserParticipant.createMany({
				data: playerIds.map((playerId) => ({
					fundraiserId,
					playerId,
				})),
				skipDuplicates: true,
			});
		}

		// return current participants for the fundraiser
		return tx.fundraiserParticipant.findMany({
			where: {
				fundraiserId,
			},
			include: {
				player: true,
			},
		});
	});
}
