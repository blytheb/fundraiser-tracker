"use server";

import { prisma } from "@/lib/prisma";
import type { Fundraiser } from "@prisma/client";
import type { FundraiserFormData } from "../types";

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

export async function changeCompletedStatus(fundraiserId: string) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id: fundraiserId,
		},
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	//draft to completed
	if (!fundraiser.isCompleted) {
		const contributions = await prisma.fundraiserContribution.aggregate({
			where: {
				fundraiserId,
			},
			_sum: {
				amount: true,
			},
		});

		const allocations = await prisma.fundraiserAllocation.aggregate({
			where: {
				fundraiserParticipant: {
					fundraiserId,
				},
				status: "ACTIVE",
			},
			_sum: {
				amount: true,
			},
		});

		const totalRaised = Number(contributions._sum.amount ?? 0);
		const totalAllocated = Number(allocations._sum.amount ?? 0);

		if (totalAllocated < totalRaised) {
			throw new Error(
				`$${(totalRaised - totalAllocated).toFixed(2)} still needs to be allocated before completing the fundraiser`,
			);
		}

		if (totalAllocated > totalRaised) {
			throw new Error(
				`Allocations exceed the amount raised by $${(totalAllocated - totalRaised).toFixed(2)}.`,
			);
		}

		return await prisma.fundraiser.update({
			where: {
				id: fundraiserId,
			},
			data: {
				isCompleted: true,
			},
		});
	}

	//completed to draft
	return await prisma.fundraiser.update({
		where: {
			id: fundraiserId,
		},
		data: {
			isCompleted: false,
		},
	});
}

export async function changePublishStatus(fundraiserId: string) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id: fundraiserId,
		},
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	return await prisma.fundraiser.update({
		where: {
			id: fundraiserId,
		},
		data: {
			isPublished: !fundraiser.isPublished,
		},
	});
}
