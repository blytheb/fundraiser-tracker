import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { summarizeTransactions } from "@/features/players/lib/summarize-transactions";

export async function getPlayerFinancialSummary(playerId: string) {
	const user = await requireUser();

	// Parent view: every user (including ADMIN_PARENT) must be linked to the player.
	// Admins view any player from the admin page instead.
	const link = await prisma.parentPlayerLink.findUnique({
		where: {
			userId_playerId: {
				userId: user.id,
				playerId,
			},
		},
		select: { id: true },
	});

	if (!link) {
		throw new Error("You do not have access to this player");
	}

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
