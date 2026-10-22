import React from "react";
import PlayerHeader from "@/features/players/PlayerHeader";
import SummaryBlock from "@/components/ui-reusable/SummaryBlock";
import {
	getPlayerById,
	getPlayerTransactions,
} from "@/features/players/data/players";
import { getPlayerTeams } from "@/features/players/data/playerTeams";
import { ItemGroup } from "@/components/ui/item";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { CircleDollarSign } from "lucide-react";
import { getPublishedFundraisersByPlayer } from "@/features/fundraisers/data/fundraisers";
import { notFound } from "next/navigation";

type PlayerPageProps = {
	params: Promise<{
		playerId: string;
	}>;
};

export default async function PlayerPage({ params }: PlayerPageProps) {
	const { playerId } = await params;
	let player;

	try {
		player = await getPlayerById(playerId);
	} catch {
		notFound();
	}

	if (!player) {
		notFound();
	}
	const [teams, fundraisers, transactions] = await Promise.all([
		getPlayerTeams(playerId),
		getPublishedFundraisersByPlayer(playerId),
		getPlayerTransactions(playerId),
	]);

	if (!player) {
		return <div>Player Not Found</div>;
	}

	const totalDistributed = fundraisers.reduce((total, fundraiser) => {
		if (!fundraiser.isCompleted || !fundraiser.isPublished) return total;

		return (
			total +
			fundraiser.transactions.reduce(
				(sum, transaction) => sum + Number(transaction.amount),
				0,
			)
		);
	}, 0);

	const totalDeposits = transactions
		.filter((transaction) => transaction.type === "PAYMENT")
		.reduce((total, transaction) => total + Number(transaction.amount), 0);

	const totalExpenses = transactions
		.filter((transaction) => transaction.type === "EXPENSE")
		.reduce((total, transaction) => total + Number(transaction.amount), 0);
	const history = [
		...fundraisers.map((fundraiser) => ({
			kind: "FUNDRAISER" as const,
			id: fundraiser.id,
			name: fundraiser.name,
			date: fundraiser.startDate,
			isCompleted: fundraiser.isCompleted,
			amount: fundraiser.isCompleted
				? fundraiser.transactions.reduce(
						(sum, transaction) => sum + Number(transaction.amount),
						0,
					)
				: null,
		})),

		...transactions
			.filter((transaction) => transaction.type !== "DISTRIBUTION")
			.map((transaction) => ({
				kind: "TRANSACTION" as const,
				id: transaction.id,
				name:
					transaction.type === "PAYMENT"
						? "Deposit"
						: transaction.type === "EXPENSE"
							? "Expense"
							: "Adjustment",
				description: transaction.description,
				date: transaction.date,
				amount: Number(transaction.amount),
				type: transaction.type,
			})),
	].sort((a, b) => b.date.getTime() - a.date.getTime());
	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
			<PlayerHeader player={player} teams={teams} />
			<div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
				<SummaryBlock
					title="Fundraiser Total"
					value={totalDistributed}
					label="Total Earned from completed and published fundraisers"
				/>
				<SummaryBlock
					title="Deposits"
					value={totalDeposits}
					label="Payments made to add to player account"
				/>
				<SummaryBlock
					title="Expenses"
					value={totalExpenses}
					label="Costs charged to the player's account"
				/>
			</div>
			<div className="space-y-1">
				{fundraisers.length === 0 ? (
					<div className="flex flex-col w-full items-center gap-3 rounded-lg border p-3">
						No Fundraisers Found
					</div>
				) : (
					<div className="space-y-4">
						<h2 className="text-lg font-semibold">Transaction History</h2>

						{history.length === 0 ? (
							<div className="flex w-full flex-col items-center gap-3 rounded-lg border p-3">
								No Transactions Found
							</div>
						) : (
							<ItemGroup>
								{history.map((entry) => (
									<Item
										key={`${entry.kind}-${entry.id}`}
										variant="outline"
										size="sm">
										<ItemMedia>
											<CircleDollarSign className="size-8 rounded-full bg-green-300" />
										</ItemMedia>

										<ItemContent className="flex flex-row items-center justify-between">
											<div className="flex flex-col gap-1">
												<ItemTitle>{entry.name}</ItemTitle>

												<ItemDescription>
													{entry.kind === "FUNDRAISER"
														? entry.isCompleted
															? "Completed"
															: "In progress"
														: entry.description ||
															entry.date.toLocaleDateString()}
												</ItemDescription>

												{entry.kind === "TRANSACTION" && entry.description && (
													<ItemDescription>
														{entry.date.toLocaleDateString()}
													</ItemDescription>
												)}
											</div>

											<div className="text-md font-bold">
												{entry.kind === "FUNDRAISER"
													? entry.isCompleted
														? `+ $${entry.amount!.toFixed(2)}`
														: "TBA"
													: entry.type === "EXPENSE"
														? `- $${entry.amount.toFixed(2)}`
														: entry.type === "PAYMENT"
															? `+ $${entry.amount.toFixed(2)}`
															: `$${entry.amount.toFixed(2)}`}
											</div>
										</ItemContent>
									</Item>
								))}
							</ItemGroup>
						)}
					</div>
				)}
			</div>
		</main>
	);
}
