import { prisma } from "@/lib/prisma";
import { requireParentAccess } from "@/lib/permissions";

export async function getMyAccessRequests() {
	const user = await requireParentAccess();

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
