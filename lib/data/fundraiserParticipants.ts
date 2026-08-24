import { prisma } from "@/lib/prisma";

export async function getFundraiserParticipants(fundraiserId: string) {
	const fundraiserParticipants = await prisma.fundraiserParticipant.findMany({
		where: {
			fundraiserId,
		},
		include: {
			player: true,
		},
	});

	return fundraiserParticipants.map((fundraiserParticipant) => ({
		...fundraiserParticipant.player,
		amount: Number(fundraiserParticipant.amount),
	}));
}

export async function getEligibleFundraiserPlayers(fundraiserId: string) {
	return prisma.player.findMany({
		where: {
			teams: {
				some: {
					team: {
						fundraiserTeams: {
							some: {
								fundraiserId,
							},
						},
					},
				},
			},
		},
		orderBy: {
			lastName: "asc",
		},
	});
}
