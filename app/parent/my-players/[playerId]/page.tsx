import { getPlayerFinancialSummary } from "@/features/players/data/get-player-financial-summary";
import PlayerFinancialView from "@/features/players/PlayerFinancialView";

type PlayerPageProps = {
	params: Promise<{
		playerId: string;
	}>;
};

export default async function PlayerPage({ params }: PlayerPageProps) {
	const { playerId } = await params;

	// checks that the logged-in parent is linked to this player
	const { player, teams, summary } = await getPlayerFinancialSummary(playerId);

	return <PlayerFinancialView player={player} teams={teams} summary={summary} />;
}
