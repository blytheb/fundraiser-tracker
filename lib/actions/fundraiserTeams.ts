"use server";

import { prisma } from "@/lib/prisma";

export async function addTeamToFundraiser(
	fundraiserId: string,
	teamId: string,
) {
	return prisma.fundraiserTeam.create({
		data: {
			fundraiserId,
			teamId,
		},
	});
}

export async function removeTeamFromFundraiser(
	fundraiserId: string,
	teamId: string,
) {
	return prisma.fundraiserTeam.delete({
		where: {
			fundraiserId_teamId: {
				fundraiserId,
				teamId,
			},
		},
	});
}
