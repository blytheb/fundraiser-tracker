"use server";

import { prisma } from "@/lib/prisma";

export async function addTeamToFundraiser(
	fundraiserId: string,
	teamId: string,
): Promise<Team> {
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
): Promise<Team> {
	return prisma.fundraiserTeam.delete({
		where: {
			fundraiserId_teamId: {
				fundraiserId,
				teamId,
			},
		},
	});
}

export async function saveFundraiserTeams(
	fundraiserId: string,
	teamIds: string[],
) {
	await prisma.fundraiserTeam.deleteMany({
		where: {
			fundraiserId,
		},
	});

	if (teamIds.length > 0) {
		await prisma.fundraiserTeam.createMany({
			data: teamIds.map((teamId) => ({
				fundraiserId,
				teamId,
			})),
		});
	}
}
