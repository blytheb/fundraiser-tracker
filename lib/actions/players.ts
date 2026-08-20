"use server";

import { prisma } from "@/lib/prisma";

type PlayerData = {
	firstName: string;
	lastName: string;
	status: boolean;
	imageUrl?: string | null;
};

export async function createPlayer(data: PlayerData) {
	return prisma.player.create({ data });
}

export async function updatePlayer(id: string, data: PlayerData) {
	return prisma.player.update({
		where: {
			id,
		},
		data: {
			firstName: data.firstName,
			lastName: data.lastName,
			status: data.status,
			imageUrl: data.imageUrl ?? null,
		},
	});
}

export async function deletePlayer(id: string) {
	return prisma.player.delete({
		where: {
			id,
		},
	});
}
