"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";

export async function createDistributionTransaction(
	allocationId: string,
	amount: number,
	description?: string,
) {
	await requireAdmin();
	return prisma.$transaction(async (tx) => {
		const allocation = await tx.fundraiserAllocation.findUnique({
			where: { id: allocationId },
			include: {
				fundraiserParticipant: {
					include: { player: true },
				},
			},
		});

		if (!allocation) {
			throw new Error("Allocation not found");
		}

		if (allocation.status !== "ACTIVE") {
			throw new Error("Only active allocations can be distributed");
		}

		if (amount <= 0) {
			throw new Error("Distribution amount must be greater than zero");
		}
		const distributed = await tx.playerTransaction.aggregate({
			where: {
				allocationId: allocation.id,
				type: "DISTRIBUTION",
			},
			_sum: {
				amount: true,
			},
		});

		const alreadyDistributed = Number(distributed._sum.amount ?? 0);
		const remaining = Number(allocation.amount) - alreadyDistributed;

		if (amount > remaining) {
			throw new Error(
				`Distribution amount exceeds remaining allocation. Remaining: ${remaining}`,
			);
		}

		return tx.playerTransaction.create({
			data: {
				playerId: allocation.fundraiserParticipant.playerId,
				fundraiserId: allocation.fundraiserParticipant.fundraiserId,
				allocationId: allocation.id,
				amount: amount,
				type: "DISTRIBUTION",
				description: description,
				date: new Date(),
			},
		});
	});
}
