"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { assertUniquePlayerName, nameKey } from "@/features/players/lib/player-names";
import type { TeamFormData } from "../types";

export type NewTeamInput = TeamFormData & {
	playerIds: string[]; // existing players to add to the roster
	newPlayers: { firstName: string; lastName: string }[]; // players to create and add
};

// Creates a team with its roster in one transaction: a team always has at least one player.
export async function createTeam(input: NewTeamInput) {
	return runAction(async () => {
		await requireAdmin();

		const name = input.name.trim();
		if (!name) {
			throw new Error("Enter a team name.");
		}

		const playerIds = [...new Set(input.playerIds)];
		if (playerIds.length + input.newPlayers.length === 0) {
			throw new Error("Add at least one player to the team.");
		}

		// the same new name entered twice in this form
		const seen = new Set<string>();
		for (const p of input.newPlayers) {
			const key = nameKey(p.firstName, p.lastName);
			if (seen.has(key)) {
				throw new Error(`"${p.firstName} ${p.lastName}" was added twice.`);
			}
			seen.add(key);
		}

		return prisma.$transaction(async (tx) => {
			const existing = await tx.player.findMany({
				where: { id: { in: playerIds } },
				select: { id: true },
			});
			if (existing.length !== playerIds.length) {
				throw new Error("One of the selected players no longer exists. Refresh and try again.");
			}

			const createdIds: string[] = [];
			for (const p of input.newPlayers) {
				const { firstName, lastName } = await assertUniquePlayerName(
					tx,
					p.firstName,
					p.lastName,
				);
				const player = await tx.player.create({
					data: { firstName, lastName, status: true, imageUrl: null },
					select: { id: true },
				});
				createdIds.push(player.id);
			}

			const team = await tx.team.create({
				data: { name, status: input.status, imageUrl: null },
			});

			await tx.teamPlayer.createMany({
				data: [...playerIds, ...createdIds].map((playerId) => ({
					teamId: team.id,
					playerId,
				})),
			});

			return team;
		}, { timeout: 15000 });
	});
}

export async function updateTeam(
	id: string,
	data: TeamFormData,
) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.team.update({
			where: {
				id,
			},
			data,
		});
	});
}

export async function deleteTeam(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.team.delete({
			where: {
				id,
			},
		});
	});
}
