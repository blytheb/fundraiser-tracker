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
