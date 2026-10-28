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
