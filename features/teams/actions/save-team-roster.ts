"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { assertUniquePlayerName, nameKey } from "@/features/players/lib/player-names";

export type RosterInput = {
	playerIds: string[]; // the full roster after saving (existing players)
	newPlayers: { firstName: string; lastName: string }[]; // players to create and add
};

// Replaces a team's roster in one transaction: adds checked players, removes
// unchecked ones, creates new players. A team can't be left with no players.
export async function saveTeamRoster(teamId: string, input: RosterInput) {
	return runAction(async () => {
		await requireAdmin();

		const playerIds = [...new Set(input.playerIds)];
		if (playerIds.length + input.newPlayers.length === 0) {
			throw new Error("A team needs at least one player.");
		}

		const seen = new Set<string>();
		for (const p of input.newPlayers) {
			const key = nameKey(p.firstName, p.lastName);
			if (seen.has(key)) {
				throw new Error(`"${p.firstName} ${p.lastName}" was added twice.`);
			}
			seen.add(key);
		}

		return prisma.$transaction(async (tx) => {
			const team = await tx.team.findUnique({ where: { id: teamId }, select: { id: true } });
			if (!team) {
				throw new Error("Team not found");
			}

			const existing = await tx.player.findMany({
				where: { id: { in: playerIds } },
				select: { id: true },
			});
			if (existing.length !== playerIds.length) {
				throw new Error("One of the selected players no longer exists. Refresh and try again.");
			}

			const createdIds: string[] = [];
			for (const p of input.newPlayers) {
				const { firstName, lastName } = await assertUniquePlayerName(tx, p.firstName, p.lastName);
				const player = await tx.player.create({
					data: { firstName, lastName, status: true, imageUrl: null },
					select: { id: true },
				});
				createdIds.push(player.id);
			}

			const desired = new Set([...playerIds, ...createdIds]);
			const current = await tx.teamPlayer.findMany({
				where: { teamId },
				select: { playerId: true },
			});
			const currentIds = new Set(current.map((c) => c.playerId));

			const toRemove = [...currentIds].filter((id) => !desired.has(id));
			const toAdd = [...desired].filter((id) => !currentIds.has(id));

			if (toRemove.length > 0) {
				await tx.teamPlayer.deleteMany({
					where: { teamId, playerId: { in: toRemove } },
				});
			}
			if (toAdd.length > 0) {
				await tx.teamPlayer.createMany({
					data: toAdd.map((playerId) => ({ teamId, playerId })),
					skipDuplicates: true,
				});
			}

			return { added: toAdd.length, removed: toRemove.length, total: desired.size };
		}, { timeout: 15000 });
	});
}
