import { getPlayerFinancialSummary } from "@/features/players/data/get-player-financial-summary";
import PlayerFinancialView, { parseHistoryFilter } from "@/features/players/PlayerFinancialView";

type PlayerPageProps = {
	params: Promise<{ playerId: string }>;
	searchParams: Promise<{ show?: string }>;
};

export default async function PlayerPage({ params, searchParams }: PlayerPageProps) {
	const { playerId } = await params;
	const { show } = await searchParams;

	// checks that the logged-in parent is linked to this player; Shared rows only
	const { player, teams, summary } = await getPlayerFinancialSummary(playerId);

	return (
		<PlayerFinancialView
			mode="parent"
			player={player}
			teams={teams}
			summary={summary}
			filter={parseHistoryFilter(show)}
			basePath={`/parent/my-players/${playerId}`}
		/>
	);
}
