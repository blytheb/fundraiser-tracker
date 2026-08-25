import { prisma } from "@/lib/prisma";
import type { Team } from "@prisma/client";

export async function getPlayerTeams(playerId: string): Promise<Team[]> {
	const playerTeams = await prisma.teamPlayer.findMany({
		where: {
			playerId,
		},
		include: {
			team: true,
		},
	});

	return playerTeams.map((playerTeam) => playerTeam.team);
}
