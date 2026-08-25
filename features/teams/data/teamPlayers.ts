import { prisma } from "@/lib/prisma";

export async function getTeamPlayers(teamId: string) {
	return prisma.teamPlayer.findMany({
		where: {
			teamId,
		},
		include: {
			player: true,
		},
	});
}
