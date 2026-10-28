"use server";

import { prisma } from "@/lib/prisma";

export async function getActiveFundraiserAllocations(fundraiserId: string) {
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
