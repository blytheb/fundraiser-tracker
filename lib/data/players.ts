import { mockPlayers } from "@/lib/mock-data/players";
import { mockTeams } from "@/lib/mock-data/teams";
import { mockTeamPlayers } from "@/lib/mock-data/team-players";

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
