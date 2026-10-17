"use server";

import { prisma } from "@/lib/prisma";

export async function addPlayerToFundraiser(
	fundraiserId: string,
	playerId: string,
) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: { id: fundraiserId },
		select: { isCompleted: true },
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (fundraiser.isCompleted) {
		throw new Error("Completed fundraisers cannot be edited.");
	}

	return prisma.fundraiserParticipant.create({
		data: {
			fundraiserId,
			playerId,
		},
	});
}

export async function removePlayerFromFundraiser(
	fundraiserId: string,
	playerId: string,
) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: { id: fundraiserId },
		select: { isCompleted: true },
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (fundraiser.isCompleted) {
		throw new Error("Completed fundraisers cannot be edited.");
	}

	return prisma.fundraiserParticipant.delete({
		where: {
			fundraiserId_playerId: {
				fundraiserId,
				playerId,
			},
		},
	});
}

export async function saveFundraiserParticipants(
	fundraiserId: string,
	playerIds: string[],
) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: { id: fundraiserId },
			select: { isCompleted: true },
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.isCompleted) {
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
