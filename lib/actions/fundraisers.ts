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

// export async function updatePlayer(id: string, data: PlaterData) {
// 	return prisma.player.update({
// 		where: {
// 			id,
// 		},
// 		data: {
// 			firstName: data.firstName,
// 			lastName: data.lastName,
// 			status: data.status,
// 			imageUrl: data.imageUrl ?? null,
// 		},
// 	});
// }

// export async function deletePlayer(id: string) {
// 	return prisma.player.delete({
// 		where: {
// 			id,
// 		},
// 	});
// }
