"use server";

import { prisma } from "@/lib/prisma";
import type { TeamFormData } from "../types";

export async function createTeam(data: TeamFormData): Promise<Team> {
	return prisma.team.create({
		data,
	});
}

export async function updateTeam(
	id: string,
	data: TeamFormData,
): Promise<Team> {
	return prisma.team.update({
		where: {
			id,
		},
		data,
	});
}

export async function deleteTeam(id: string): Promise<Team> {
	return prisma.team.delete({
		where: {
			id,
		},
	});
}
