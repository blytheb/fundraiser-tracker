"use server";

import { prisma } from "@/lib/prisma";
import type { FundraiserFormData } from "@/features/fundraisers/type";

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

export async function createFundraiserAndAddToTeam(
	teamId: string,
	data: FundraiserFormData,
) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.create({
			data: {
				name: data.name,
				description: "No description",
				startDate: Date("01-01-2010"),
				status: "ACTIVE",
				distributionMethod: "EQUAL",
			},
		});

		await tx.fundraiserTeam.create({
			data: {
				teamId,
				fundraiserId: fundraiser.id,
			},
		});

		return fundraiser;
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
