"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authorization";
import { revalidatePath } from "next/cache";

export async function requestPlayerAccess(playerId: string) {
	const user = await requireUser();

	if (user.role !== "PARENT") {
		throw new Error("Only parent accounts can request player access.");
	}

	if (!playerId?.trim()) {
		throw new Error("A player must be selected");
	}

	const player = await prisma.player.findUnique({
		where: { id: playerId },
		select: { id: true, status: true },
	});

	if (!player || !player.status) {
		throw new Error("Player not found or inactive");
	}

	const existingLink = await prisma.parentPlayerLink.findUnique({
		where: {
			userId_playerId: {
				userId: user.id,
				playerId,
			},
		},
	});

	if (existingLink) {
		throw new Error("You already have access to this player.");
	}

	const existingRequest = await prisma.playerAccessRequest.findFirst({
		where: {
			userId: user.id,
			playerId,
			status: "PENDING",
		},
	});

	if (existingRequest) {
		throw new Error("You already have pending request for this player");
	}

	await prisma.playerAccessRequest.create({
		data: {
			userId: user.id,
			playerId,
		},
	});

	revalidatePath("/dashboard");

	return { success: true };
}
