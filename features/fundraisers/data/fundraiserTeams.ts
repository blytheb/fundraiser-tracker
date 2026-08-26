import type { Team } from "@prisma/client";

export async function getFundraiserTeams(
	fundraiserId: string,
): Promise<Team[]> {
	const fundraiserTeams = await prisma.fundraiserTeam.findMany({
		where: {
			fundraiserId,
		},
		include: {
			team: true,
		},
	});

	return fundraiserTeams.map((fundraiserTeam) => fundraiserTeam.team);
}
