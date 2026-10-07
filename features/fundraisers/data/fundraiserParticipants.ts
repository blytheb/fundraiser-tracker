import { prisma } from "@/lib/prisma";

export async function getFundraiserParticipants(fundraiserId: string) {
	return await prisma.fundraiserParticipant.findMany({
		where: {
			fundraiserId,
		},
		include: {
			player: true,
		},
	});
}
