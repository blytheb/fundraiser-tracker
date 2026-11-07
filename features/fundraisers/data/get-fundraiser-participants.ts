import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function getFundraiserParticipants(fundraiserId: string) {
	await requireAdmin();
	return await prisma.fundraiserParticipant.findMany({
		where: {
			fundraiserId,
		},
		include: {
			player: true,
		},
	});
}
