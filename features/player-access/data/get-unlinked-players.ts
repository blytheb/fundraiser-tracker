import { prisma } from "@/lib/prisma";
import { requireParentAccess } from "@/lib/permissions";

//players a parent can request access to (parent request page only)
export async function getUnlinkedPlayers() {
	await requireParentAccess();

	return prisma.player.findMany({
		where: { status: true },
		select: {
			id: true,
			firstName: true,
			lastName: true,
		},
		orderBy: { lastName: "asc" },
	});
}
