"use server";

import { prisma } from "@/lib/prisma";

type FundraiserData = {
	name: string;
	description: string;
	startDate: DateTime;
	status: "ACTIVE" | "COMPLETED";
};

export async function createFundraiser(data: FundraiserData) {
	return prisma.fundraiser.create({ data });
}

export async function updateFundraiser(id: string, data: PlaterData) {
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
