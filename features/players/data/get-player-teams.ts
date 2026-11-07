import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import type { Team } from "@prisma/client";

export async function getPlayerTeams(playerId: string): Promise<Team[]> {
	await requireAdmin();
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
