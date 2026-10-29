import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";

export async function getMyAccessRequests() {
	const user = await requireUser();

	if (user.role !== "PARENT") {
		throw new Error("Only parents can view their access requests.");
	}

	return prisma.playerAccessRequest.findMany({
		where: {
			userId: user.id,
		},
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			playerId: true,
			status: true,
			createdAt: true,
			player: {
				select: {
					firstName: true,
					lastName: true,
				},
			},
		},
	});
}
