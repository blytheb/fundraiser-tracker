import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";

export async function getMyLinkedPlayerIds() {
	const user = await requireUser();

	return prisma.parentPlayerLink.findMany({
		where: {
			userId: user.id,
		},
		select: {
			playerId: true,
		},
	});
}
