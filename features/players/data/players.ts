import { prisma } from "@/lib/prisma";
import type { Player } from "@prisma/client";
import type { PlayerWithFundraisers, PlayerWithTeams } from "../types";

export function getPlayers(search?: string): Promise<Player[]> {
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

export async function getActivePlayers(): Promise<Player[]> {
	return prisma.player.findMany({
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
	return prisma.player.findUnique({
		where: {
			id,
		},
	});
}

export async function getPlayerWithTeams(
	id: string,
): Promise<PlayerWithTeams | null> {
	return prisma.player.findUnique({
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
	return prisma.player.findUnique({
		where: {
			id,
		},
		include: {
			fundraiserParticipants: {
				include: {
					fundraiser: true,
				},
			},
		},
	});
}
