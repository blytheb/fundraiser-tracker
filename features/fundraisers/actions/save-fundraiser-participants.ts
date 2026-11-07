"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function saveFundraiserParticipants(
	fundraiserId: string,
	playerIds: string[],
) {
	await requireAdmin();

	return prisma.$transaction(async (tx) => {
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
		//remove players who are no longer selected
		await tx.fundraiserParticipant.deleteMany({
			where: {
				fundraiserId,
				playerId: {
					notIn: playerIds,
				},
			},
		});

		//add newly selected players
		if (playerIds.length > 0) {
			await tx.fundraiserParticipant.createMany({
				data: playerIds.map((playerId) => ({
					fundraiserId,
					playerId,
				})),
				skipDuplicates: true,
			});
		}

		//every participant needs an allocation: new participants start at $0
		const withoutAllocation = await tx.fundraiserParticipant.findMany({
			where: {
				fundraiserId,
				allocations: { none: { status: "ACTIVE" } },
			},
			select: { id: true },
		});

		if (withoutAllocation.length > 0) {
			await tx.fundraiserAllocation.createMany({
				data: withoutAllocation.map((participant) => ({
					fundraiserParticipantId: participant.id,
					amount: 0,
					status: "ACTIVE" as const,
				})),
			});
		}

		// return current participants for the fundraiser
		return tx.fundraiserParticipant.findMany({
			where: {
				fundraiserId,
			},
			include: {
				player: true,
			},
		});
	});
}
