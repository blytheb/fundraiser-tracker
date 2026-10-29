import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import type { Player } from "@prisma/client";

export async function getAvailablePlayersForTeam(
	teamId: string,
): Promise<Player[]> {
	await requireAdmin();
	return prisma.player.findMany({
		where: {
			status: true,
			teams: {
				none: {
					teamId,
				},
			},
		},
	});
}
