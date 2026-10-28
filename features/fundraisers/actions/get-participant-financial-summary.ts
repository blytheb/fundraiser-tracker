"use server";

import { prisma } from "@/lib/prisma";

export async function getParticipantFinancialSummary(
	fundraiserParticipantId: string,
) {
	const participant = await prisma.fundraiserParticipant.findUnique({
		where: {
			id: fundraiserParticipantId,
		},
		include: {
			player: true,
		},
	});

	if (!participant) {
		throw new Error("Fundraiser participant not found");
	}

	// Get all active allocations for this participant
	const allocations = await prisma.fundraiserAllocation.findMany({
		where: {
			fundraiserParticipantId,
			status: "ACTIVE",
		},
		include: {
			transactions: {
				where: {
					type: "DISTRIBUTION",
					status: "ACTIVE",
				},
				select: {
					amount: true,
				},
			},
		},
	});

	const allocationAmount = allocations.reduce(
		(total, allocation) => total + Number(allocation.amount),
		0,
	);
	const distributedAmount = allocations.reduce(
		(total, allocation) =>
			total +
			allocation.transactions.reduce(
				(sum, transaction) => sum + Number(transaction.amount),
				0,
			),
		0,
	);

	const remainingAmount = Math.max(0, allocationAmount - distributedAmount);
	return {
		participant,
		allocationAmount,
		distributedAmount,
		remainingAmount,
	};
}
