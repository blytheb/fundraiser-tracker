import { notFound } from "next/navigation";

import {
	getPlayerById,
	getPlayerTransactions,
} from "@/features/players/data/players";
import { getPlayerTeams } from "@/features/players/data/get-player-teams";
import { summarizeTransactions } from "@/features/players/lib/summarize-transactions";
import PlayerFinancialView from "@/features/players/PlayerFinancialView";
import PlayerTransactionForm from "@/components/forms/players/PlayerTransactionForm";

type PlayerPageProps = {
	params: Promise<{
		playerId: string;
	}>;
};

export default async function PlayerPage({ params }: PlayerPageProps) {
	const { playerId } = await params;

	// admin data functions: any player, admin only
	const [player, teams, transactions] = await Promise.all([
		getPlayerById(playerId),
		getPlayerTeams(playerId),
		getPlayerTransactions(playerId),
	]);

	if (!player) notFound();

	return (
		<PlayerFinancialView
			player={player}
			teams={teams}
			summary={summarizeTransactions(transactions)}>
			<PlayerTransactionForm playerId={playerId} />
		</PlayerFinancialView>
	);
}
