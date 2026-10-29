import { prisma } from "@/lib/prisma";

export async function getUnlinkedPlayers() {
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
