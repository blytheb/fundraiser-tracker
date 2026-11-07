"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function getParticipantFinancialSummary(
	fundraiserParticipantId: string,
) {
	await requireAdmin();

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
					status: "PUBLISHED",
				},
				select: {
					amount: true,
				},
			},
		},
	});

	const zero = new Prisma.Decimal(0);
	const allocationAmount = Prisma.Decimal.sum(
		zero,
		...allocations.map((allocation) => allocation.amount),
	);
	const distributedAmount = Prisma.Decimal.sum(
		zero,
		...allocations.flatMap((allocation) =>
			allocation.transactions.map((transaction) => transaction.amount),
		),
	);
	const remainingAmount = Prisma.Decimal.max(
		zero,
		allocationAmount.minus(distributedAmount),
	);

	return {
		participant,
		allocationAmount: allocationAmount.toNumber(),
		distributedAmount: distributedAmount.toNumber(),
		remainingAmount: remainingAmount.toNumber(),
	};
}
