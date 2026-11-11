"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

type PlayerTransactionData = {
	playerId: string;
	fundraiserId?: string;
	allocationId?: string;
	amount: number;
	description?: string;
	date: string;
};

export async function addPlayerPayment(data: PlayerTransactionData) {
	return runAction(async () => {
		await requireAdmin();
		const transaction = await prisma.playerTransaction.create({
			data: {
				playerId: data.playerId,
				fundraiserId: data.fundraiserId,
				allocationId: data.allocationId,
				amount: data.amount,
				type: "PAYMENT",
				direction: "INCOME",
				status: "PUBLISHED",
				description: data.description,
				date: new Date(data.date),
			},
		});
		return {
			...transaction,
			amount: Number(transaction.amount),
		};
	});
}
