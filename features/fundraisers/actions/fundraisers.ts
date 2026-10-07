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
			isPublished: false,
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

	if (!fundraiser.isCompleted) {
		throw new Error("Fundraiser is not complete yet and cannot be published");
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
