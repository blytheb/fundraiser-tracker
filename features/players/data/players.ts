import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import type { Player } from "@prisma/client";
import { requirePlayerAccess } from "@/features/players/lib/require-player-access";

export async function getPlayers(search?: string): Promise<Player[]> {
	await requireAdmin();
	return prisma.player.findMany({
		where: search
			? {
					OR: [
						{
							firstName: {
								contains: search,
								mode: "insensitive",
							},
						},
						{
							lastName: {
								contains: search,
								mode: "insensitive",
							},
						},
					],
				}
			: undefined,
		orderBy: [
			{
				lastName: "asc",
			},
			{
				firstName: "asc",
			},
		],
	});
}

//admin only: admins can view any player. Parent pages use getPlayerWithTeams, which checks the parent link.
export async function getPlayerById(id: string): Promise<Player | null> {
	await requireAdmin();

	return prisma.player.findUnique({
		where: {
			id,
		},
	});
}

export async function getPlayerTransactions(playerId: string) {
	await requirePlayerAccess(playerId, { allowAdmins: true });

	return prisma.playerTransaction.findMany({
		where: {
			playerId,
			status: "PUBLISHED",
			OR: [
				{
					type: {
						not: "DISTRIBUTION",
					},
				},
				{
					type: "DISTRIBUTION",
					fundraiser: {
						is: {
							status: "PUBLISHED",
						},
					},
				},
			],
		},
		orderBy: {
			date: "desc",
		},
		include: {
			teamTransaction: {
				select: {
					id: true,
					name: true,
				},
			},
			fundraiser: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});
}
