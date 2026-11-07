"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function getFundraiserFinancialSummary(fundraiserId: string) {
	await requireAdmin();

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

	const zero = new Prisma.Decimal(0);
	const totalRaised = contributions._sum.amount ?? zero;
	const currentlyAllocated = allocations._sum.amount ?? zero;
	const availableToAllocate = Prisma.Decimal.max(
		zero,
		totalRaised.minus(currentlyAllocated),
	);

	//convert to numbers only at the end, so the client gets plain values
	return {
		totalRaised: totalRaised.toNumber(),
		currentlyAllocated: currentlyAllocated.toNumber(),
		availableToAllocate: availableToAllocate.toNumber(),
		participantCount,
	};
}
