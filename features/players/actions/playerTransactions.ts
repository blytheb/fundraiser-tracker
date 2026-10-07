//what acctually happpen to a players balance
// createDistributionTransaction();

"use server";

import { prisma } from "@/lib/prisma";

type PlayerTransactionData = {
	playerId: string;
	fundraiserId?: string;
	allocationId?: string;
	amount: number;
	description?: string;
	date: string;
};

export async function addPlayerPayment(data: PlayerTransactionData) {
	return prisma.playerTransaction.create({
		data: {
			playerId: data.playerId,
			fundraiserId: data.fundraiserId,
			allocationId: data.allocationId,
			amount: data.amount,
			type: "PAYMENT",
			description: data.description,
			date: new Date(data.date),
		},
	});
}

export async function addPlayerExpense(data: PlayerTransactionData) {
	return prisma.playerTransaction.create({
		data: {
			playerId: data.playerId,
			fundraiserId: data.fundraiserId,
			allocationId: data.allocationId,
			amount: data.amount,
			type: "EXPENSE",
			description: data.description,
			date: new Date(data.date),
		},
	});
}

export async function addPlayerAdjustment(data: PlayerTransactionData) {
	return prisma.playerTransaction.create({
		data: {
			playerId: data.playerId,
			fundraiserId: data.fundraiserId,
			allocationId: data.allocationId,
			amount: data.amount,
			type: "ADJUSTMENT",
			description: data.description,
			date: new Date(data.date),
		},
	});
}

export async function addPlayerDistribution(data: PlayerTransactionData) {
	return prisma.playerTransaction.create({
		data: {
			playerId: data.playerId,
			fundraiserId: data.fundraiserId,
			allocationId: data.allocationId,
			amount: data.amount,
			type: "DISTRIBUTION",
			description: data.description,
			date: new Date(data.date),
		},
	});
}

export async function getPlayerFinancialSummary(playerId: string) {
	const player = await prisma.player.findUnique({
		where: { id: playerId },
		select: {
			id: true,
		},
	});

	if (!player) {
		throw new Error("Player not found");
	}
	const transactions = await prisma.playerTransaction.findMany({
		where: { playerId },
		select: {
			amount: true,
			type: true,
		},
	});

	let totalPayments = 0;
	let totalExpenses = 0;
	let totalAdjustments = 0;
	let totalDistributions = 0;

	for (const transaction of transactions) {
		const amount = Number(transaction.amount);

		switch (transaction.type) {
			case "PAYMENT":
				totalPayments += amount;
				break;
			case "EXPENSE":
				totalExpenses += amount;
				break;
			case "ADJUSTMENT":
				totalAdjustments += amount;
				break;
			case "DISTRIBUTION":
				totalDistributions += amount;
				break;
		}
	}

	const balance =
		totalPayments - totalExpenses + totalAdjustments + totalDistributions;

	return {
		totalPayments,
		totalExpenses,
		totalAdjustments,
		totalDistributions,
		balance,
	};
}

export async function createDistributionTransaction(
	allocationId: string,
	amount: number,
	description?: string,
) {
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
