import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authorization";

export async function getMyLinkedPlayers() {
	const user = await requireUser();

	if (user.role !== "PARENT") {
		throw new Error("Only parents can access their linked players.");
	}

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
