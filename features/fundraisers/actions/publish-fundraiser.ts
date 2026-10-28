//when does the fundraiser become official
"use server";

import { prisma } from "@/lib/prisma";

//complete to publish status
export async function publishFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
			select: {
				isCompleted: true,
				isPublished: true,
				participants: true,
			},
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.isPublished) {
			throw new Error("Fundraiser is already published");
		}
		if (!fundraiser.isCompleted) {
			throw new Error(
				"A fundraiser must be completed before it can be published",
			);
		}

		if (fundraiser.participants.length === 0) {
			throw new Error("A fundraiser must have at least one participant");
		}

		await tx.fundraiser.update({
			where: {
				id: fundraiserId,
			},
			data: {
				isPublished: true,
			},
		});

		return {
			success: true,
		};
	});
}

export async function reopenFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
		});
		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (!fundraiser.isCompleted) {
			throw new Error("Fundraiser is already in draft mode.");
		}

		await tx.playerTransaction.updateMany({
			where: {
				fundraiserId,
				status: "ACTIVE",
				type: "DISTRIBUTION",
			},
			data: {
				status: "VOID",
			},
		});

		await tx.fundraiser.update({
			where: {
				id: fundraiserId,
			},
			data: {
				isCompleted: false,
				isPublished: false,
			},
		});

		return {
			success: true,
		};
	});
}
