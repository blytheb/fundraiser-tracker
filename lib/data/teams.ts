import { prisma } from "@/lib/prisma";

export async function getAllTeams() {
	return prisma.team.findMany({
		orderBy: {
			name: "asc",
		},
		include: {
			_count: {
				select: {
					players: true,
					fundraiserTeams: true,
				},
			},
		},
	});
}

export async function getActiveTeams() {
	return prisma.team.findMany({
		where: {
			status: "IN_SEASON",
		},
		orderBy: {
			name: "asc",
		},
		include: {
			_count: {
				select: {
					players: true,
					fundraiserTeams: true,
				},
			},
		},
	});
}

export async function getTeamById(teamId: string) {
	const team = await prisma.team.findUnique({
		where: {
			id: teamId,
		},
		include: {
			players: {
				include: {
					player: true,
				},
			},
			fundraiserTeams: {
				include: {
					fundraiser: {
						include: {
							funds: true,
						},
					},
				},
			},
		},
	});

	if (!team) {
		return null;
	}

	return {
		...team,
		players: team.players.map((teamPlayer) => teamPlayer.player),
		fundraisers: team.fundraiserTeams.map((fundraiserTeam) => {
			const fundraiser = fundraiserTeam.fundraiser;
			const totalRaised = fundraiser.funds.reduce(
				(total, fund) => total + Number(fund.amount),
				0,
			);
			return {
				...fundraiser,
				funds: fundraiser.funds.map((fund) => ({
					...fund,
					amount: Number(fund.amount),
				})),
				totalRaised,
			};
		}),
	};
}
