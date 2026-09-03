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
	return prisma.$transaction(async (tx) => {
		await tx.fundraiserParticipant.deleteMany({
			where: {
				fundraiserId,
				playerId: {
					notIn: playerIds,
				},
			},
		});

		if (playerIds.length > 0) {
			console.log("playerIds:", playerIds);

			const existingPlayers = await tx.player.findMany({
				where: {
					id: {
						in: playerIds,
					},
				},
				select: {
					id: true,
					firstName: true,
					lastName: true,
				},
			});

			console.log("existingPlayers:", existingPlayers);

			const existingPlayerIds = new Set(
				existingPlayers.map((player) => player.id),
			);

			const missingPlayerIds = playerIds.filter(
				(id) => !existingPlayerIds.has(id),
			);

			console.log("missingPlayerIds:", missingPlayerIds);

			await tx.fundraiserParticipant.createMany({
				data: playerIds.map((playerId) => ({
					fundraiserId,
					playerId,
				})),
				skipDuplicates: true,
			});
		}

		const participants = await tx.fundraiserParticipant.findMany({
			where: {
				fundraiserId,
			},
			include: {
				player: true,
			},
		});

		return participants.map((participant) => ({
			...participant,
			allocatedAmount: Number(participant.allocatedAmount),
		}));
	});
}
