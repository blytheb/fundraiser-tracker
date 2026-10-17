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

type PlayerPageProps = {
	params: Promise<{
		playerId: string;
	}>;
};

export default async function PlayerPage({ params }: PlayerPageProps) {
	const { playerId } = await params;
	const [player, teams, fundraisers, transactions] = await Promise.all([
		getPlayerById(playerId),
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
	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
			<PlayerHeader player={player} teams={teams} />
			<div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
				<SummaryBlock
					title="Fundraiser Total"
					value={`$${totalDistributed.toFixed(2)}`}
					label="Total Earned from completed and published fundraisers"
				/>
				<SummaryBlock
					title="Deposits"
					value={`$${totalDeposits.toFixed(2)}`}
					label="Payments made to add to player account"
				/>
				<SummaryBlock
					title="Expenses"
					value={`$${totalExpenses.toFixed(2)}`}
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
						<ItemGroup>
							{fundraisers.map((fundraiser) => {
								const distribution = fundraiser.transactions.reduce(
									(total, transaction) => total + Number(transaction.amount),
									0,
								);

								return (
									<Item key={fundraiser.id} variant="outline" size="sm">
										<ItemMedia>
											<CircleDollarSign className="size-8 bg-green-300 rounded-full" />
										</ItemMedia>
										<ItemContent className="flex flex-row justify-between items-center">
											<div className="flex flex-col gap-1">
												<ItemTitle>{fundraiser.name}</ItemTitle>
												<ItemDescription>
													{fundraiser.startDate.toLocaleString()}
												</ItemDescription>
											</div>
											<div className="font-bold text-md">
												{fundraiser.isCompleted
													? `+ $${distribution.toFixed(2)}`
													: "TBA"}
											</div>
										</ItemContent>
									</Item>
								);
							})}
						</ItemGroup>
					</div>
				)}
			</div>
		</main>
	);
}
