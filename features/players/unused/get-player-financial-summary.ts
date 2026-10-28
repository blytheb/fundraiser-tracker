"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authorization";

export async function getPlayerFinancialSummary(playerId: string) {
	const user = await requireUser();

	if (user.role === "PARENT") {
		const link = await prisma.parentPlayerLink.findUnique({
			where: {
				userId_playerId: {
					userId: user.id,
					playerId,
				},
			},
			select: { id: true },
		});
		if (!link) {
			throw new Error("You do not have access to this player's finances");
		}
	}
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
		where: {
			playerId,
			status: "ACTIVE",
			OR: [
				{
					type: {
						not: "DISTRIBUTION",
					},
				},
				{
					type: "DISTRIBUTION",
					fundraiser: {
						is: {
							isCompleted: true,
							isPublished: true,
						},
					},
				},
			],
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
