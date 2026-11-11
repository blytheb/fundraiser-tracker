import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export type TeamOption = {
	id: string;
	name: string;
	players: { id: string; name: string }[];
};

// Teams to choose from in the team transaction form: active teams, plus any
// teams already on the transaction being edited (even if their season ended).
export async function getTeamOptions(includeTeamIds: string[] = []): Promise<TeamOption[]> {
	await requireAdmin();

	const teams = await prisma.team.findMany({
		where: {
			OR: [{ status: "IN_SEASON" }, { id: { in: includeTeamIds } }],
		},
		select: {
			id: true,
			name: true,
			players: {
				where: { player: { status: true } }, // active players only
				select: { player: { select: { id: true, firstName: true, lastName: true } } },
				orderBy: [{ player: { lastName: "asc" } }, { player: { firstName: "asc" } }],
			},
		},
		orderBy: { name: "asc" },
	});

	return teams.map((team) => ({
		id: team.id,
		name: team.name,
		players: team.players.map(({ player }) => ({
			id: player.id,
			name: `${player.firstName} ${player.lastName}`,
		})),
	}));
}
