"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function getActiveFundraiserAllocations(fundraiserId: string) {
	await requireAdmin();

	const allocations = await prisma.fundraiserAllocation.findMany({
		where: {
			fundraiserParticipant: {
				fundraiserId,
			},
			status: "ACTIVE",
		},
		select: {
			id: true,
			fundraiserParticipantId: true,
			amount: true,
			status: true,
		},
	});

	return allocations.map((allocation) => ({
		...allocation,
		amount: Number(allocation.amount),
	}));
}
