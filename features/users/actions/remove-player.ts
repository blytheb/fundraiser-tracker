"use server";

import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function removePlayerFromUser(userId: string, playerId: string) {
	await requireAdmin();

	const link = await prisma.parentPlayerLink.findUnique({
		where: {
			userId_playerId: {
				userId,
				playerId,
			},
		},
	});

	if (!link) {
		throw new Error("This player is not linked to this account.");
	}

	await prisma.parentPlayerLink.delete({
		where: {
			id: link.id,
		},
	});

	revalidatePath("/admin/users");
}
