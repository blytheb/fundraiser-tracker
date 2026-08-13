import { mockPlayers } from "@/lib/mock-data/players";
import { mockTeams } from "@/lib/mock-data/teams";
import { mockTeamPlayers } from "@/lib/mock-data/team-players";

//Give me every player along with the teams they belong to
export function getPlayersWithTeams() {
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

//Give me every player that belongs to a certain team
export function getPlayersByTeamId(teamId: string){
	const teamMemberships = mockTeamPlayers.filter(
		(teamPlayer) => teamPlayer.teamId === teamId,
	);

	return teamMemberships.map((membership) =>
		mockPlayers.find(
			(player) => player.id ===membership.playerId,
		),
	)
	.filter(Boolean);
}
