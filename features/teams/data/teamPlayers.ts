import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import type { Player } from "@prisma/client";

export async function getTeamPlayers(teamId: string): Promise<Player[]> {
	await requireAdmin();
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
	await requireAdmin();
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
