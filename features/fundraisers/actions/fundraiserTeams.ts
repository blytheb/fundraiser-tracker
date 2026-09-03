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
		// 1. Find all players who are eligible based on
		//    the NEW set of selected teams.
		const eligiblePlayers = await tx.teamPlayer.findMany({
			where: {
				teamId: {
					in: teamIds,
				},
			},
			select: {
				playerId: true,
			},
		});

		const eligiblePlayerIds = eligiblePlayers.map(
			(teamPlayer) => teamPlayer.playerId,
		);

		// 2. Replace the fundraiser's selected teams.
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

		// 3. Remove participants who are no longer eligible.
		//    If no teams are selected, remove all participants.
		if (eligiblePlayerIds.length === 0) {
			await tx.fundraiserParticipant.deleteMany({
				where: {
					fundraiserId,
				},
			});
		} else {
			await tx.fundraiserParticipant.deleteMany({
				where: {
					fundraiserId,
					playerId: {
						notIn: eligiblePlayerIds,
					},
				},
			});
		}

		// 4. Return the updated fundraiser.
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
