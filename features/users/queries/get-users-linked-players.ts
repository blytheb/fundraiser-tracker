import { prisma } from "@/lib/prisma";
import { requireParentAccess } from "@/lib/authorization";

export async function getMyLinkedPlayers() {
	const user = await requireParentAccess();

	return prisma.parentPlayerLink.findMany({
		where: {
			userId: user.id,
		},
		select: {
			player: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					imageUrl: true,
				},
			},
		},
		orderBy: {
			player: {
				lastName: "asc",
			},
		},
	});
}
