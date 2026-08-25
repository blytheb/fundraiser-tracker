import { prisma } from "@/lib/prisma";
import type { Player } from "@/prisma/client";

export function getPlayers(): Promise<Player[]> {
	return prisma.player.findMany({
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

export async function getActivePlayers(): Promise<Player[]> {
	return prisma.team.findMany({
		where: {
			status: true,
		},
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
	return prisma.team.findUnique({
		where: {
			id,
		},
	});
}

export async function getPlayerWithTeams(
	id: string,
): Promise<PlayerWithTeams | null> {
	return prisma.team.findUnique({
		where: {
			id,
		},
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
	return prisma.team.findUnique({
		where: {
			id,
		},
		include: {
			fundraiseParticipants: {
				include: {
					fundraiser: true,
				},
			},
		},
	});
}
