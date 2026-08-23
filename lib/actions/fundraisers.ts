"use server";

import { prisma } from "@/lib/prisma";
import { getFundraiserTotal } from "@/lib/helper";

type FundraiserData = {
	name: string;
	description: string;
	startDate: Date;
	status: "ACTIVE" | "COMPLETED";
};

type FundraiserFundData = {
	fundraiserId: string;
	type: "SALES" | "EVENT_PROFIT" | "TIPS" | "OTHER";
	amount: number;
	description?: string;
};

export async function createFundraiser(data: FundraiserData) {
	return prisma.fundraiser.create({ data });
}

export async function updateFundraiser(id: string, data: FundraiserData) {
	return prisma.fundraiser.update({
		where: {
			id,
		},
		data: {
			name: data.name,
			description: data.description,
			startDate: data.startDate,
			status: data.status ?? "ACTIVE",
		},
	});
}

export async function deleteFundraiser(id: string) {
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

export async function addFundraiserFund(data: FundraiserFundData) {
	return prisma.$transaction(async (tx) => {
		// Add the new funds
		await tx.fundraiserFund.create({
			data: {
				fundraiserId: data.fundraiserId,
				type: data.type,
				amount: data.amount,
				description: data.description,
			},
		});

		// Get fundraiser and participants
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: data.fundraiserId,
			},
			include: {
				funds: true,
				participants: true,
			},
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		// Don't automatically redistribute custom fundraisers
		if (fundraiser.distributionMethod !== "EQUAL") {
			return fundraiser;
		}

		if (fundraiser.participants.length === 0) {
			return fundraiser;
		}

		// Calculate total
		const totalRaised = fundraiser.funds.reduce(
			(total, fund) => total + Number(fund.amount),
			0,
		);

		// Calculate equal share
		const amountPerParticipant = totalRaised / fundraiser.participants.length;

		// Update each participant
		for (const participant of fundraiser.participants) {
			await tx.fundraiserParticipant.update({
				where: {
					id: participant.id,
				},
				data: {
					amount: amountPerParticipant,
				},
			});
		}

		return fundraiser;
	});
}
