"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import type { Player } from "@prisma/client";
import type { PlayerFormData } from "../types";

export async function createPlayer(data: PlayerFormData) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.player.create({
			data: {
				...data,
				imageUrl: null,
			},
		});
	});
}

export async function updatePlayer(
	id: string,
	data: PlayerFormData,
) {
	return runAction(async () => {
		await requireAdmin();
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
	});
}

export async function deletePlayer(id: string) {
	return runAction(async () => {
		await requireAdmin();
		return prisma.player.delete({
			where: {
				id,
			},
		});
	});
}
