import type { Team, Fundraiser } from "@prisma/client";

export async function getFundraiserTeams(
	fundraiserId: string,
): Promise<Team[]> {
	const teams = await prisma.fundraiserTeam.findMany({
		where: {
			fundraiserId,
		},
		include: {
			team: true,
		},
	});

	return teams.map((team) => team.team);
}

export async function getTeamFundraisers(
	teamId: string,
): Promise<Fundraiser[]> {
	const allFundraisers = await prisma.fundraiserTeam.findMany({
		where: {
			teamId,
		},
		include: {
			fundraiser: true,
		},
	});

	return allFundraisers.map((fundraiser) => fundraiser.fundraiser);
}

export async function getAvailableFundraisersForTeam(
	teamId: string,
): Promise<Fundraiser[]> {
	return prisma.fundraiser.findMany({
		where: {
			status: "ACTIVE",
			teams: {
				none: {
					teamId,
				},
			},
		},
	});
}
