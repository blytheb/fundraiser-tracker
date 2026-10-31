"use server";

import { prisma } from "@/lib/prisma";

export async function saveFundraiserTeams(
	fundraiserId: string,
	teamIds: string[],
): Promise<void> {
	await prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: { id: fundraiserId },
			select: { status: true },
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.status !== "DRAFT") {
			throw new Error("Completed fundraisers cannot be edited.");
		}
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
