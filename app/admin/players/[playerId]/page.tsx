import { notFound } from "next/navigation";

import {
	getActivePlayerOptions,
	getPlayerById,
	getPlayerLedgerForAdmin,
} from "@/features/players/data/players";
import { getPlayerTeams } from "@/features/players/data/get-player-teams";
import { summarizeTransactions } from "@/features/players/lib/summarize-transactions";
import PlayerFinancialView, { parseHistoryFilter } from "@/features/players/PlayerFinancialView";
import PlayerHeaderActions from "@/features/players/PlayerHeaderActions";
import AddPlayerTransactionButton from "@/features/players/AddPlayerTransactionButton";
import MovePotMoneyButton from "@/features/players/MovePotMoneyButton";

type PlayerPageProps = {
	params: Promise<{ playerId: string }>;
	searchParams: Promise<{ show?: string }>;
};

export default async function PlayerPage({ params, searchParams }: PlayerPageProps) {
	const { playerId } = await params;
	const { show } = await searchParams;

	// admin data functions: any player, admin only. The ledger includes Final rows.
	const [player, teams, ledger, players] = await Promise.all([
		getPlayerById(playerId),
		getPlayerTeams(playerId),
		getPlayerLedgerForAdmin(playerId),
		getActivePlayerOptions(),
	]);

	if (!player) notFound();

	const summary = summarizeTransactions(ledger);

	return (
		<PlayerFinancialView
			mode="admin"
			player={player}
			teams={teams}
			summary={summary}
			filter={parseHistoryFilter(show)}
			basePath={`/admin/players/${playerId}`}
			actions={<PlayerHeaderActions player={player} />}
			addButton={<AddPlayerTransactionButton playerId={playerId} players={players} />}
			moveButton={<MovePotMoneyButton playerId={playerId} pots={summary.pots} />}
			editPlayers={players}
		/>
	);
}
