import { prisma } from "@/lib/prisma";
import {
	requireParentAccess,
	requireAdmin,
	requireUser,
} from "@/lib/permissions";
import type { Player } from "@prisma/client";
import type { PlayerWithFundraisers, PlayerWithTeams } from "../types";

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

export async function getPlayerById(id: string): Promise<Player | null> {
	const user = await requireParentAccess();

	const link = await prisma.parentPlayerLink.findUnique({
		where: {
			userId_playerId: {
				userId: user.id,
				playerId: id,
			},
		},
		select: { id: true },
	});

	if (!link) {
		throw new Error("You do not have access to this player.");
	}

	return prisma.player.findUnique({
		where: {
			id,
		},
	});
}

export async function getPlayerWithTeams(
	id: string,
): Promise<PlayerWithTeams | null> {
	const user = await requireUser();

	if (user.role === "PARENT") {
		const link = await prisma.parentPlayerLink.findUnique({
			where: {
				userId_playerId: {
					userId: user.id,
					playerId: id,
				},
			},
			select: { id: true },
		});

		if (!link) {
			throw new Error("You do not have access to this player's teams.");
		}
	}

	return prisma.player.findUnique({
		where: { id },
		include: {
			teams: {
				include: {
					team: true,
				},
			},
		},
	});
}

export async function getPlayerWithFundraisers(
	id: string,
): Promise<PlayerWithFundraisers | null> {
	const user = await requireUser();

	if (user.role === "PARENT") {
		const link = await prisma.parentPlayerLink.findUnique({
			where: {
				userId_playerId: {
					userId: user.id,
					playerId: id,
				},
			},
			select: { id: true },
		});

		if (!link) {
			throw new Error("You do not have access to this player's fundraisers.");
		}
	}

	return prisma.player.findUnique({
		where: { id },
		include: {
			fundraiserParticipants: {
				include: {
					fundraiser: true,
				},
			},
		},
	});
}

export async function getPlayerTransactions(playerId: string) {
	const user = await requireUser();

	if (user.role === "PARENT") {
		const link = await prisma.parentPlayerLink.findUnique({
			where: {
				userId_playerId: {
					userId: user.id,
					playerId,
				},
			},
			select: { id: true },
		});
		if (!link) {
			throw new Error("You do not have access to this player's finances");
		}
	}

	return prisma.playerTransaction.findMany({
		where: {
			playerId,
			status: "ACTIVE",
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
			fundraiser: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});
}
