"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function removePlayerFromTeam(teamId: string, playerId: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.teamPlayer.delete({
			where: {
				teamId_playerId: {
					teamId,
					playerId,
				},
			},
		});
	});
}
