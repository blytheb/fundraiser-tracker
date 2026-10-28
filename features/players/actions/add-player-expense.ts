"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";

type PlayerTransactionData = {
	playerId: string;
	fundraiserId?: string;
	allocationId?: string;
	amount: number;
	description?: string;
	date: string;
};

export async function addPlayerExpense(data: PlayerTransactionData) {
	await requireAdmin();
	const transaction = await prisma.playerTransaction.create({
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

	return {
		...transaction,
		amount: Number(transaction.amount),
	};
}
