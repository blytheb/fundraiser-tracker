import { prisma } from "@/lib/prisma";

export async function getAllTeams() {
	return prisma.team.findMany({
		orderBy: {
			name: "asc",
		},
	});
}

export async function getActiveTeams() {
	if (!useDatabase) {
		return mockTeams.filter((team) => team.status === "IN_SEASON");
	}
	return prisma.team.findMany({
		where: {
			status: "IN_SEASON",
		},
	});
}

export async function getTeamById(teamId: string) {
	return prisma.team.findUnique({
		where: {
			id: teamId,
		},
	});
}
