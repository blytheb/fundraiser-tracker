"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function getPendingPlayerAccessRequests() {
	await requireAdmin();

	return prisma.playerAccessRequest.findMany({
		where: {
			status: "PENDING",
		},
		orderBy: {
			createdAt: "asc",
		},
		select: {
			id: true,
			createdAt: true,
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			player: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
				},
			},
		},
	});
}
