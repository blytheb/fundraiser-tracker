import { prisma } from "@/lib/prisma";
import type { Player } from "@prisma/client";

export async function getTeamPlayers(teamId: string): Promise<Player[]> {
	const teamPlayers = await prisma.teamPlayer.findMany({
		where: {
			teamId,
		},
		include: {
			player: true,
		},
	});

	return teamPlayers.map((teamPlayer) => teamPlayer.player);
}

export async function getAvailablePlayersForTeam(
	teamId: string,
): Promise<Player[]> {
	return prisma.player.findMany({
		where: {
			status: true,
			teams: {
				none: {
					teamId,
				},
			},
		},
	});
}
