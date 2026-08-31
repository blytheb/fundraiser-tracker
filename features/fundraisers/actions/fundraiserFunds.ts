"use server";

import { prisma } from "@/lib/prisma";
import type { FundraiserFundFormData } from ".../types";

type AddFundraiserFundData = FundraiserFundFormData & {
	fundraiserId: string;
};

export async function addFundraiserFund(
	data: AddFundraiserFundData,
): Promise<void> {
	await prisma.$transaction(async (tx) => {
		// 1. Add the fund
		await tx.fundraiserFund.create({
			data: {
				fundraiserId: data.fundraiserId,
				type: data.type,
				amount: data.amount,
				description: data.description,
			},
		});

		// 2. Get fundraiser and participants
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

		// 3. Custom distributions are not automatically recalculated
		if (fundraiser.distributionMethod !== "EQUAL") {
			return;
		}

		// 4. Nothing to distribute
		if (fundraiser.participants.length === 0) {
			return;
		}

		// 5. Calculate total raised
		const totalRaised = fundraiser.funds.reduce(
			(total, fund) => total + Number(fund.amount),
			0,
		);

		// 6. Calculate equal share
		const amountPerParticipant = totalRaised / fundraiser.participants.length;

		// 7. Update each participant
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
	});
}

export async function deleteFund(id: string) {
	return prisma.fundraiserFund.delete({
		where: {
			id,
		},
	});
}
