"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { assertUniquePlayerName } from "@/features/players/lib/player-names";
import type { PlayerFormData } from "../types";

export async function createPlayer(data: PlayerFormData) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			const { firstName, lastName } = await assertUniquePlayerName(
				tx,
				data.firstName,
				data.lastName,
			);

			return tx.player.create({
				data: {
					firstName,
					lastName,
					status: data.status,
					imageUrl: null,
				},
			});
		});
	});
}

export async function updatePlayer(id: string, data: PlayerFormData) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			// renaming can't create a duplicate (the player itself is excluded)
			const { firstName, lastName } = await assertUniquePlayerName(
				tx,
				data.firstName,
				data.lastName,
				id,
			);

			return tx.player.update({
				where: { id },
				data: {
					firstName,
					lastName,
					status: data.status,
					imageUrl: data.imageUrl ?? null,
				},
			});
		});
	});
}

export async function deletePlayer(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			const transactionCount = await tx.playerTransaction.count({
				where: { playerId: id },
			});
			if (transactionCount > 0) {
				throw new Error(
					'This player has transactions, so they can\'t be deleted. Edit the player and turn off "Active player" instead.',
				);
			}

			// a team can't be left with no players
			const onlyPlayerOf = await tx.team.findMany({
				where: {
					players: { some: { playerId: id } },
					NOT: { players: { some: { playerId: { not: id } } } },
				},
				select: { name: true },
			});
			if (onlyPlayerOf.length > 0) {
				const names = onlyPlayerOf.map((t) => t.name).join(", ");
				throw new Error(
					`This player is the only player on ${names}. Add another player to the team first, or delete the team.`,
				);
			}

			return tx.player.delete({ where: { id } });
		});
	});
}
