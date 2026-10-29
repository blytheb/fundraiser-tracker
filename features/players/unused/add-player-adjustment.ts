"use server";

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

export async function addPlayerAdjustment(data: PlayerTransactionData) {
	await requireAdmin();
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
