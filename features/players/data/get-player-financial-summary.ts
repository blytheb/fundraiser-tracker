import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { getPlayerTeams } from "@/features/players/data/get-player-teams";

export async function getPlayerFinancialSummary(playerId: string) {
	const user = await requireUser();

	// Admins can view any player. Parents can view only linked players.
	if (user.role !== "ADMIN") {
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

		getPlayerTeams(playerId),

		prisma.playerTransaction.findMany({
			where: {
				playerId,
				status: "ACTIVE",
				OR: [
					{ type: { not: "DISTRIBUTION" } },
					{
						type: "DISTRIBUTION",
						fundraiser: {
							is: {
								isCompleted: true,
								isPublished: true,
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

	// Calculate financial totals.
	let totalDeposits = 0;
	let totalDistributions = 0;
	let totalExpenses = 0;
	let adjustmentBalance = 0;

	for (const transaction of transactions) {
		const amount = Number(transaction.amount);

		switch (transaction.type) {
			case "PAYMENT":
				totalDeposits += Math.abs(amount);
				break;
			case "DISTRIBUTION":
				totalDistributions += Math.abs(amount);
				break;
			case "EXPENSE":
				totalExpenses += Math.abs(amount);
				break;
			case "ADJUSTMENT":
				adjustmentBalance += amount;
				break;
		}
	}

	const positiveAdjustments = transactions
		.filter(
			(transaction) =>
				transaction.type === "ADJUSTMENT" && Number(transaction.amount) > 0,
		)
		.reduce((total, transaction) => total + Number(transaction.amount), 0);

	const negativeAdjustments = transactions
		.filter(
			(transaction) =>
				transaction.type === "ADJUSTMENT" && Number(transaction.amount) < 0,
		)
		.reduce((total, transaction) => total + Number(transaction.amount), 0);

	const totalMoneyIn = totalDeposits + totalDistributions + positiveAdjustments;

	const totalMoneyOut = totalExpenses + Math.abs(negativeAdjustments);

	const currentBalance = totalMoneyIn - totalMoneyOut;

	// Prepare transaction history for display.
	const history = transactions
		.map((transaction) => {
			const amount = Number(transaction.amount);

			const title =
				transaction.type === "DISTRIBUTION"
					? (transaction.fundraiser?.name ?? "Fundraiser Distribution")
					: transaction.type === "PAYMENT"
						? "Player Deposit"
						: transaction.type === "EXPENSE"
							? "Player Expense"
							: "Balance Adjustment";

			const description =
				transaction.description ??
				(transaction.type === "DISTRIBUTION"
					? "Fundraiser distribution"
					: transaction.type === "PAYMENT"
						? "Individual deposit"
						: transaction.type === "EXPENSE"
							? "Individual expense"
							: "Balance adjustment");

			const signedAmount =
				transaction.type === "EXPENSE"
					? -Math.abs(amount)
					: transaction.type === "ADJUSTMENT"
						? amount
						: Math.abs(amount);

			return {
				id: transaction.id,
				title,
				description,
				date: transaction.date,
				type: transaction.type,
				amount: signedAmount,
			};
		})
		.sort((a, b) => b.date.getTime() - a.date.getTime());

	return {
		player,
		teams,
		initials:
			`${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase(),
		totalDeposits,
		totalDistributions,
		totalExpenses,
		adjustmentBalance,
		totalMoneyIn,
		totalMoneyOut,
		currentBalance,
		history,
	};
}
