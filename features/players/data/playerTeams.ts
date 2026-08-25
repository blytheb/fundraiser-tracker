import { prisma } from "@/lib/prisma";
import type { Team } from "@prisma/client";

export async function getPlayerTeams(id: string): Promise<Team[]> {
	const playerTeams = await prisma.teamPlayer.findMany({
		where: {
			id,
		},
		include: {
			teams: true,
		},
	});

	return playerTeams.map((playerTeam) => playerTeam.team);
}
