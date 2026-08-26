"use server";

import { prisma } from "@/lib/prisma";
import type { Fundraiser } from "@/prisma/client";
import type { FundraiserFormData } from ".../types";

export async function createFundraiser(
	data: FundraiserFormData,
): Promise<Fundraiser> {
	return prisma.fundraiser.create({ data });
}

export async function updateFundraiser(
	id: string,
	data: FundraiserFormData,
): Promise<Fundraiser> {
	return prisma.fundraiser.update({
		where: {
			id,
		},
		data,
	});
}

export async function deleteFundraiser(id: string): Promise<Fundraiser> {
	return prisma.fundraiser.delete({
		where: {
			id,
		},
	});
}

// export async function distributeFunds(fundraiserId: string) {
// 	const fundraiser = await prisma.fundraiser.findUnique({
// 		where: {
// 			id: fundraiserId,
// 		},
// 		include: {
// 			participants: true,
// 		},
// 	});

// 	if (!fundraiser) {
// 		throw new Error("Fundraiser not found");
// 	}

// 	if (fundraiser.participants.length === 0) {
// 		throw new Error("No participants found");
// 	}

// 	if (fundraiser.totalAmount <= 0) {
// 		throw new Error("Fundraiser has no money to distribute");
// 	}

// 	// const totalCents = fundraiser.totalAmount.mul(100).toNumber();
// 	const participantCount = fundraiser.participants.length;
// 	const centsPerPlayer = Math.floor(totalCents / participantCount);
// 	const remainder = totalCents % participantCount;

// 	await prisma.$transaction(
// 		fundraiser.participants.map((participant, index) => {
// 			const distributionCents = centsPerPlayer + (index < remainder ? 1 : 0);

// 			const distributionAmount = distributionCents / 100;

// 			return prisma.fundraiserParticipant.update({
// 				where: {
// 					id: participant.id,
// 				},
// 				data: {
// 					distributionAmount,
// 				},
// 			});
// 		}),
// 	);
// }
