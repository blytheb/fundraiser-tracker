import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

import type { Team, Fundraiser } from "@prisma/client";

export async function getFundraiserTeams(
	fundraiserId: string,
): Promise<Team[]> {
	await requireAdmin();
	return prisma.team.findMany({
		where: {
			fundraiserTeams: {
				some: {
					fundraiserId,
				},
			},
		},
		orderBy: {
			name: "asc",
		},
	});
}


export async function getAvailableFundraisersForTeam(
	teamId: string,
): Promise<Fundraiser[]> {
	await requireAdmin();
	return prisma.fundraiser.findMany({
		where: {
			status: "DRAFT",
			teams: {
				none: {
					teamId,
				},
			},
		},
	});
}
