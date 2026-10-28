import { prisma } from "@/lib/prisma";
import type { Team } from "@prisma/client";
import type { TeamWithPlayers } from "../types";
import { requireAdmin } from "@/lib/permissions";

export async function getTeams(search?: string): Promise<Team[]> {
	await requireAdmin();

	return prisma.team.findMany({
		where: search
			? {
					name: {
						contains: search,
						mode: "insensitive",
					},
				}
			: undefined,

		orderBy: {
			name: "asc",
		},
	});
}

export async function getActiveTeams(): Promise<Team[]> {
	return prisma.team.findMany({
		where: {
			status: "IN_SEASON",
		},

		orderBy: {
			name: "asc",
		},
	});
}

export async function getActiveTeamsWithPlayers(): Promise<TeamWithPlayers[]> {
	const teams = await prisma.team.findMany({
		where: {
			status: "IN_SEASON",
		},
		include: {
			players: {
				include: {
					player: true,
				},
			},
		},
		orderBy: {
			name: "asc",
		},
	});

	return teams;
}

export async function getTeamById(id: string): Promise<Team | null> {
	return prisma.team.findUnique({
		where: {
			id,
		},
	});
}

export async function getTeamWithPlayers(
	id: string,
): Promise<TeamWithPlayers | null> {
	const team = await prisma.team.findUnique({
		where: {
			id,
		},
		include: {
			players: {
				include: {
					player: true,
				},
			},
		},
	});
	if (!team) {
		return null;
	}

	return {
		...team,
		players: team.players,
	};
}
