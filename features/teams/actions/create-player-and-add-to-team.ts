"use server";

import { prisma } from "@/lib/prisma";
import type { PlayerFormData } from "@/features/players/types";

export async function createPlayerAndAddToTeam(
	teamId: string,
	data: PlayerFormData,
) {
	return prisma.$transaction(async (tx) => {
		const player = await tx.player.create({
			data: {
				firstName: data.firstName,
				lastName: data.lastName,
				status: true,
				imageUrl: data.imageUrl ?? null,
			},
		});

		await tx.teamPlayer.create({
			data: {
				teamId,
				playerId: player.id,
			},
		});

		return player;
	});
}
