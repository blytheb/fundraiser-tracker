// addPlayerToFundraiser();
// removePlayerFromFundraiser();
// saveFundraiserParticipants();

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
	await prisma.$transaction([
		prisma.fundraiserParticipant.deleteMany({
			where: {
				fundraiserId,
			},
		}),

		prisma.fundraiserParticipant.createMany({
			data: playerIds.map((playerId) => ({
				fundraiserId,
				playerId,
			})),
		}),
	]);
}
