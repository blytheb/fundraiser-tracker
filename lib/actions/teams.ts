"use server";

import { prisma } from "@/lib/prisma";

type TeamData = {
	name: data.name;
	status: data.status;
	imageUrl?: data.imageUrl | null;
};

export async function createTeam(data: TeamData) {
	return prisma.team.create({ data });
}

export async function updateTeam(id: string, data: TeamData) {
	return prisma.team.update({
		where: {
			id,
		},
		data: {
			name: data.name,
			status: data.status,
			imageUrl: data.imageUrl ?? null,
		},
	});
}

export async function deleteTeam(id: string) {
	return prisma.team.delete({
		where: {
			id,
		},
	});
}
