import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function getAvailablePlayers() {
	await requireAdmin();
	return await prisma.player.findMany({
		where: {
			status: true,
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
		},
		orderBy: [
			{
				firstName: "asc",
			},
			{
				lastName: "asc",
			},
		],
	});
}
