"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import type { TeamFormData } from "../types";
import type { Team } from "@prisma/client";

export async function createTeam(data: TeamFormData) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.team.create({
			data: {
				...data,
				imageUrl: null,
			},
		});
	});
}

export async function updateTeam(
	id: string,
	data: TeamFormData,
) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.team.update({
			where: {
				id,
			},
			data,
		});
	});
}

export async function deleteTeam(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.team.delete({
			where: {
				id,
			},
		});
	});
}
