import { prisma } from "@/lib/prisma";

export async function getAllTeamPlayers(teamId: string) {
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
