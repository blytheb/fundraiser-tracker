import { prisma } from "@/lib/prisma";

export async function getAvailablePlayers() {
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
