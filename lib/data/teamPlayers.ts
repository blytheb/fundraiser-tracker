import { prisma } from "@/lib/prisma";

export async function getTeamPlayers(teamId: string) {
	const teamPlayers = prisma.teamPlayer.findMany({
		where: {
			teamId,
		},
		include: {
			player: true,
		},
	});

	return teamPlayers.map((teamPlayer) => teamPlayer.player);
}
