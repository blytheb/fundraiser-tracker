"use server";

import { prisma } from "@/lib/prisma";
import type { Player } from "@prisma/client";
import type { PlayerFormData } from "../types";

export async function createPlayer(data: PlayerFormData): Promise<Player> {
	return prisma.player.create({
		data: {
			...data,
			imageUrl: null,
		},
	});
}

export async function updatePlayer(
	id: string,
	data: PlayerFormData,
): Promise<Player> {
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

export async function deletePlayer(id: string): Promise<Player> {
	return prisma.player.delete({
		where: {
			id,
		},
	});
}
