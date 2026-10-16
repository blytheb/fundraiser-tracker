//when does the fundraiser become official
"use server";

import { prisma } from "@/lib/prisma";
import { getFundraiserFinancialSummary } from "@/features/fundraisers/actions/fundraiserAllocation";

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

export async function unpublishFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
		});
		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (!fundraiser.isPublished) {
			throw new Error("Fundraiser is already unpublished");
		}

		await tx.fundraiser.update({
			where: {
				id: fundraiserId,
			},
			data: {
				isPublished: false,
			},
		});

		return {
			success: true,
		};
	});
}

export async function completeFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: { id: fundraiserId },
			include: {
				participants: {
					include: {
						player: true,
						allocations: {
							where: {
								status: "ACTIVE",
							},
						},
					},
				},
			},
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.isCompleted) {
			throw new Error("Fundraiser is already completed");
		}

		if (
			fundraiser.participants.some(
				(participant) => participant.allocations.length != 1,
			)
		) {
			throw new Error(
				"Each participant must have exactly one active allocation before completing",
			);
		}

		const summary = await getFundraiserFinancialSummary(fundraiserId);

		if (summary.availableToAllocate > 0) {
			throw new Error("All funds must be allocated before completing");
		}

		await tx.playerTransaction.createMany({
			data: fundraiser.participants.map((participant) => ({
				playerId: participant.playerId,
				fundraiserId: fundraiser.id,
				allocationId: participant.allocations[0].id,
				amount: participant.allocations[0].amount,
				type: "DISTRIBUTION",
				description: `Fundraiser distribution`,
			})),
		});

		return tx.fundraiser.update({
			where: { id: fundraiserId },
			data: { isCompleted: true },
		});
	});
}

export async function incompleteFundraiser(fundraiserId: string) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: { id: fundraiserId },
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (!fundraiser.isCompleted) {
		throw new Error("Fundraiser is already in draft mode");
	}

	return prisma.fundraiser.update({
		where: { id: fundraiserId },
		data: { isCompleted: false },
	});
}
