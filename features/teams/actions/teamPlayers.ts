"use server";

import { prisma } from "@/lib/prisma";

export async function addPlayerToTeam(teamId: string, playerId: string) {
	return prisma.teamPlayer.create({
		data: {
			teamId,
			playerId,
		},
	});
}

export async function removePlayerFromTeam(teamId: string, playerId: string) {
	return prisma.teamPlayer.delete({
		where: {
			teamId_playerId: {
				teamId,
				playerId,
			},
		},
	});
}

type CreatePlayerData = {
	firstName: string;
	lastName: string;
	imageUrl?: string;
};

export async function createPlayerAndAddToTeam(
	teamId: string,
	data: CreatePlayerData,
) {
	return prisma.$transaction(async (tx) => {
		const player = await tx.player.create({
			data: {
				firstName: data.firstName,
				lastName: data.lastName,
				status: true,
				imageUrl: data.imageUrl | null,
			},
		});

		await tx.teamPlayer.create({
			data: {
				teamId,
				playerId: player.id,
			},
		});

		return player;
	});
}

export async function saveTeamRoster(teamId: string, playerIds: string[]) {
	await prisma.teamPlayer.deleteMany({
		where: {
			teamId,
		},
	});

	return prisma.teamPlayer.createMany({
		data: playerIds.map((playerId) => ({
			teamId,
			playerId,
		})),
	});
}
