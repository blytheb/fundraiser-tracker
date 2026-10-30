"use server";

import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignPlayerToUser(userId: string, playerId: string) {
	const admin = await requireAdmin();

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			role: true,
		},
	});

	if (!user || (user.role !== "ADMIN_PARENT" && user.role !== "PARENT")) {
		throw new Error("This account does not have parent access.");
	}

	const player = await prisma.player.findUnique({
		where: { id: playerId },
		select: { id: true },
	});

	if (!player) {
		throw new Error("Player not found.");
	}

	const existingLink = await prisma.parentPlayerLink.findUnique({
		where: {
			userId_playerId: {
				userId,
				playerId,
			},
		},
	});

	if (existingLink) {
		throw new Error("This player is already linked to this account.");
	}

	await prisma.parentPlayerLink.create({
		data: {
			userId,
			playerId,
			createdById: admin.id,
		},
	});

	revalidatePath("/admin/users");
}
