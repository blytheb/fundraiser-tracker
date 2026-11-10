"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireParentAccess } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function cancelPlayerAccessRequest(requestId: string) {
	return runAction(async () => {
		const user = await requireParentAccess();

		const request = await prisma.playerAccessRequest.findFirst({
			where: {
				id: requestId,
				userId: user.id,
				status: "PENDING",
			},
			select: {
				id: true,
			},
		});

		if (!request) {
			throw new Error(
				"Pending access request not found or you are not authorized to cancel it.",
			);
		}

		await prisma.playerAccessRequest.update({
			where: {
				id: request.id,
			},
			data: {
				status: "CANCELLED",
			},
		});

		revalidatePath("/parent/request-player-access");
		revalidatePath("/parent/my-access-requests");
		revalidatePath("/admin/player-access-requests");

		return { success: true };
	});
}
