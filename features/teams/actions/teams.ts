"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import type { TeamFormData } from "../types";
import type { Team } from "@prisma/client";

export async function createTeam(data: TeamFormData): Promise<Team> {
	await requireAdmin();

	return prisma.team.create({
		data: {
			...data,
			imageUrl: null,
		},
	});
}

export async function updateTeam(
	id: string,
	data: TeamFormData,
): Promise<Team> {
	await requireAdmin();

	return prisma.team.update({
		where: {
			id,
		},
		data,
	});
}

export async function deleteTeam(id: string): Promise<Team> {
	await requireAdmin();

	return prisma.team.delete({
		where: {
			id,
		},
	});
}
