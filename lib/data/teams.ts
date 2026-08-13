import { mockTeams } from "@/lib/mock-data/teams";

export function getAllTeams() {
	return mockTeams;
}

export function getActiveTeams() {
	return mockTeams.filter((team) => team.status === "Active");
}

export function getTeamById(teamId: string) {
	return mockTeams.find((team) => team.id === teamId);
}
