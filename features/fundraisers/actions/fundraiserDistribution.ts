"use server";

import { prisma } from "@/lib/prisma";

//get total contribuitons, get fundraiser participants, calculate totalraised/number participants
// update participants allocated Amount
export async function calculateEqualDistribution(
	fundraiserId: string,
	totalRaised: number,
) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id: fundraiserId,
		},
		include: {
			participants: true,
		},
	});
	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}
	if (fundraiser.participants.length === 0) {
		throw new Error("No participants found");
	}
	if (totalRaised <= 0) {
		throw new Error("Fundraiser has no money to distribute");
	}
	const participantCount = fundraiser.participants.length;

	const totalCents = Math.round(totalRaised * 100);

	const centsPerPlayer = Math.floor(totalCents / participantCount);
	const remainder = totalCents % participantCount;
	await prisma.$transaction(
		fundraiser.participants.map((participant, index) => {
			const allocationCents = centsPerPlayer + (index < remainder ? 1 : 0);
			const allocationAmount = allocationCents / 100;
			return prisma.fundraiserParticipant.update({
				where: {
					id: participant.id,
				},
				data: {
					allocatedAmount: allocationAmount,
				},
			});
		}),
	);
}
