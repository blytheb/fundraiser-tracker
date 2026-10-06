"use server";

import { prisma } from "@/lib/prisma";
// getFundraiserFinancialSummary();
// setEqualDistribution();
// setCustomDistribution();
// redistributeFunds();
// voidAllocations();

export async function setEqualAllocation(
	fundraiserId: string,
	totalRaised: number,
) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id: fundraiserId,
		},
		include: {
			participants: true,
		},
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (fundraiser.participants.length === 0) {
		throw new Error("No participants found");
	}

	if (totalRaised <= 0) {
		throw new Error("Fundraiser has no money to distribute");
	}

	const participantCount = fundraiser.participants.length;

	// Convert dollars to cents to avoid floating-point issues.
	const totalCents = Math.round(totalRaised * 100);

	const centsPerPlayer = Math.floor(totalCents / participantCount);
	const remainder = totalCents % participantCount;

	return prisma.$transaction(async (tx) => {
		// Void the current allocations.
		await tx.allocation.updateMany({
			where: {
				fundraiserParticipantId: {
					in: fundraiser.participants.map((participant) => participant.id),
				},
				status: "ACTIVE",
			},
			data: {
				status: "VOID",
			},
		});

		// Create the new allocations.
		const allocations = fundraiser.participants.map((participant, index) => {
			const allocationCents = centsPerPlayer + (index < remainder ? 1 : 0);

			return {
				fundraiserParticipantId: participant.id,
				amount: allocationCents / 100,
				status: "ACTIVE" as const,
			};
		});

		await tx.allocation.createMany({
			data: allocations,
		});

		return tx.allocation.findMany({
			where: {
				fundraiserParticipantId: {
					in: fundraiser.participants.map((participant) => participant.id),
				},
				status: "ACTIVE",
			},
		});
	});
}
