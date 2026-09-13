"use server";

import { prisma } from "@/lib/prisma";
import type { Fundraiser, FundraiserStatus } from "@prisma/client";
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

export async function changeStatus(
	fundraiserId: string,
	status: FundraiserStatus,
) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id: fundraiserId,
		},
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	// if (fundraiser.status === "DRAFT" && status !== "COMPLETED") {
	// 	throw new Error("Draft fundraisers can only be completed");
	// }

	// if (fundraiser.status === "COMPLETED" && status !== "PUBLISHED") {
	// 	throw new Error("Completed fundraisers can only be published");
	// }

	// if (fundraiser.status === "PUBLISHED") {
	// 	throw new Error("Published fundraisers cannot change status");
	// }

	return await prisma.fundraiser.update({
		where: {
			id: fundraiserId,
		},
		data: {
			status,
		},
	});
}
