"use server";

import { prisma } from "@/lib/prisma";
import type { Fundraiser } from "@/prisma/client";
import type { FundraiserFormData } from ".../types";

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

export async function deleteFund(id: string) {
	return prisma.fundraiserFund.delete({
		where: {
			id,
		},
	});
}
