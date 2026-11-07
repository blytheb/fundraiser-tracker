"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function removePlayerFromTeam(teamId: string, playerId: string) {
	await requireAdmin();

	return prisma.teamPlayer.delete({
		where: {
			teamId_playerId: {
				teamId,
				playerId,
			},
		},
	});
}
