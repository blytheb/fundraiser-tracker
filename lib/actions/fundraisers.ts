"use server";

import { prisma } from "@/lib/prisma";

type FundraiserData = {
	name: string;
	description: string;
	status: "ACTIVE" | "COMPLETED";
	imageUrl?: string | null;
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
			imageUrl: data.imageUrl ?? null,
		},
	});
}

// export async function deletePlayer(id: string) {
// 	return prisma.player.delete({
// 		where: {
// 			id,
// 		},
// 	});
// }
