import { prisma } from "@/lib/prisma";
import type { Team } from "@prisma/client";

export async function getTeams(): Promise<Team[]> {
	return prisma.team.findMany({
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
	return prisma.team.findUnique({
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
}

export async function getTeamWithFundraisers(
	id: string,
): Promise<TeamWithFundraisers | null> {
	return prisma.team.findUnique({
		where: {
			id,
		},
		include: {
			fundraiserTeams: {
				include: {
					fundraiser: true,
				},
			},
		},
	});
}

export async function getTeamData(
	id: string,
): Promise<TeamWithPlayersAndFundraisers> {
	return prisma.team.findUnique({
		where: {
			id,
		},
		include: {
			players: {
				include: {
					player: true,
				},
			},
			fundraiserTeams: {
				include: {
					fundraiser: true,
				},
			},
		},
	});
}
