import { prisma } from "@/lib/prisma";

export function getAllPlayers() {
	return prisma.player.findMany({
		orderBy: [
			{
				lastName: "asc",
			},
			{
				firstName: "asc",
			},
		],
	});
}

//Give me every player along with the teams they belong to
export function getPlayersWithTeams() {
	if (!useDatabase) {
		return mockPlayers.map((player) => {
			const teamMemberships = mockTeamPlayers.filter(
				(teamPlayer) => teamPlayer.playerId === player.id,
			);

			const teams = teamMemberships
				.map((membership) =>
					mockTeams.find((team) => team.id === membership.teamId),
				)
				.filter(Boolean);

			return {
				...player,
				teams,
			};
		});
	}
}

//Give me every player that belongs to a certain team
export function getPlayersByTeamId(teamId: string) {
	if (!useDatabase) {
		const teamMemberships = mockTeamPlayers.filter(
			(teamPlayer) => teamPlayer.teamId === teamId,
		);

		return teamMemberships
			.map((membership) =>
				mockPlayers.find((player) => player.id === membership.playerId),
			)
			.filter(Boolean);
	}
}
