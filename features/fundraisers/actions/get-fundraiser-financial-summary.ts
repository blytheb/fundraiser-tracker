"use server";

import { prisma } from "@/lib/prisma";

export async function getFundraiserFinancialSummary(fundraiserId: string) {
	// Implementation for getting financial summary
	const fundraiser = await prisma.fundraiser.findUnique({
		where: { id: fundraiserId },
		select: {
			id: true,
		},
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	const [contributions, allocations, participantCount] = await Promise.all([
		prisma.fundraiserContribution.aggregate({
			where: { fundraiserId },
			_sum: { amount: true },
		}),
		prisma.fundraiserAllocation.aggregate({
			where: { fundraiserParticipant: { fundraiserId }, status: "ACTIVE" },
			_sum: { amount: true },
		}),
		prisma.fundraiserParticipant.count({
			where: { fundraiserId },
		}),
	]);

	const totalRaised = Number(contributions._sum.amount ?? 0);
	const currentlyAllocated = Number(allocations._sum.amount ?? 0);
	const availableToAllocate = Math.max(0, totalRaised - currentlyAllocated);

	return {
		totalRaised,
		currentlyAllocated,
		availableToAllocate,
		participantCount,
	};
}
