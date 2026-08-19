import { prisma } from "@/lib/prisma";

export async function getFundraiserTeams(fundraiserId: string) {
	const fundraiserTeams = await prisma.fundraiserTeams.findMany({
		where: {
			fundraiserId,
		},
		include: {
			team: true,
		},
	});

	return fundraiserTeams.map((fundraiserTeam) => fundraiserTeam.team);
}
