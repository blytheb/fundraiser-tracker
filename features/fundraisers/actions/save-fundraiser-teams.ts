"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { assertDraft } from "@/features/fundraisers/lib/fundraiser-status";

export async function saveFundraiserTeams(
	fundraiserId: string,
	teamIds: string[],
) {
	return runAction(async () => {
		await requireAdmin();

		await prisma.$transaction(async (tx) => {
			await assertDraft(tx, fundraiserId);

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
	});
}
