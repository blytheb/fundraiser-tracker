"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorization";
import { revalidatePath } from "next/cache";

type ReviewDecision = "APPROVED" | "REJECTED";

export async function reviewPlayerAccess(
	requestId: string,
	decision: ReviewDecision,
) {
	const admin = await requireAdmin();

	if (!requestId?.trim()) {
		throw new Error("A request must be selected.");
	}

	if (decision !== "APPROVED" && decision !== "REJECTED") {
		throw new Error("Invalid review decision.");
	}

	await prisma.$transaction(async (tx) => {
		const request = await tx.playerAccessRequest.findUnique({
			where: { id: requestId },
		});

		if (!request) {
			throw new Error("Access request not found");
		}

		if (request.status !== "PENDING") {
			throw new Error("This request has already been reviewed.");
		}

		if (decision === "APPROVED") {
			await tx.parentPlayerLink.upsert({
				where: {
					userId_playerId: {
						userId: request.userId,
						playerId: request.playerId,
					},
				},
				update: {},
				create: {
					userId: request.userId,
					playerId: request.playerId,
					createdById: admin.id,
				},
			});
		}

		const result = await tx.playerAccessRequest.updateMany({
			where: {
				id: request.id,
				status: "PENDING",
			},
			data: {
				status: decision,
				reviewedById: admin.id,
				reviewedAt: new Date(),
			},
		});

		if (result.count !== 1) {
			throw new Error("This request has already been reviewed.");
		}
	});

	revalidatePath("/dashboard");
	revalidatePath("/admin");

	return { success: true };
}
