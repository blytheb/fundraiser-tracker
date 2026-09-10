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
