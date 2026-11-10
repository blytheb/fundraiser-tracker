"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function addPlayerToTeam(teamId: string, playerId: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.teamPlayer.create({
			data: {
				teamId,
				playerId,
			},
		});
	});
}
