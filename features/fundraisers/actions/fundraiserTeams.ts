"use server";

import { prisma } from "@/lib/prisma";
import { FundraiserFormData } from "@/features/fundraisers/types";

export async function addTeamToFundraiser(
	fundraiserId: string,
	teamId: string,
): Promise<FundraiserTeam> {
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
): Promise<FundraiserTeam> {
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
				startDate: new Date("2010-01-01"),
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
): Promise<Fundraiser> {
	return prisma.$transaction(async (tx) => {
		await tx.fundraiserTeam.deleteMany({
			where: {
				fundraiserId,
			},
		});

		if (teamIds.length > 0) {
			await tx.fundraiserTeam.createMany({
				data: teamIds.map((teamId) => ({
					fundraiserId,
					teamId,
				})),
			});
		}

		return tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
			include: {
				teams: {
					include: {
						team: true,
					},
				},
			},
		});
	});
}
