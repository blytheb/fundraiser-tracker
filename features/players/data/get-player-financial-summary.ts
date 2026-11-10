import { prisma } from "@/lib/prisma";
import { requirePlayerAccess } from "@/features/players/lib/require-player-access";
import { summarizeTransactions } from "@/features/players/lib/summarize-transactions";

export async function getPlayerFinancialSummary(playerId: string) {
	// Parent view: everyone (including ADMIN_PARENT) must be linked to the player.
	// Admins view any player from the admin page instead.
	await requirePlayerAccess(playerId, { allowAdmins: false });

	const [player, teams, transactions] = await Promise.all([
		prisma.player.findUnique({
			where: { id: playerId },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				imageUrl: true,
				status: true,
			},
		}),

		//access was checked above, so query teams directly
		//(getPlayerTeams is admin only)
		prisma.teamPlayer
			.findMany({
				where: { playerId },
				include: { team: true },
			})
			.then((rows) => rows.map((row) => row.team)),

		prisma.playerTransaction.findMany({
			where: {
				playerId,
				status: "PUBLISHED",
				OR: [
					{ type: { not: "DISTRIBUTION" } },
					{
						type: "DISTRIBUTION",
						fundraiser: {
							is: {
								status: "PUBLISHED",
							},
						},
					},
				],
			},
			select: {
				id: true,
				amount: true,
				type: true,
				description: true,
				date: true,
				fundraiser: {
					select: { name: true },
				},
			},
			orderBy: { date: "desc" },
		}),
	]);

	if (!player) {
		throw new Error("Player not found");
	}

	return {
		player,
		teams,
		summary: summarizeTransactions(transactions),
	};
}
