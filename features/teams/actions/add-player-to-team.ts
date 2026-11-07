"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function addPlayerToTeam(teamId: string, playerId: string) {
	await requireAdmin();

	return prisma.teamPlayer.create({
		data: {
			teamId,
			playerId,
		},
	});
}
