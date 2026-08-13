import { mockTeams } from "@/lib/mock-data/teams";

export function getActiveTeams() {
	return mockTeams.filter((team) => team.status === "Active");
}
