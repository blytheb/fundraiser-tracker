import { notFound } from "next/navigation";

import TeamHeader from "@/features/teams/TeamHeader";
import SummarySection from "@/features/teams/SummarySection";
import TabSection from "@/features/teams/TabSection";

import { getTeamById } from "@/features/teams/data/teams";
import {
	getTeamPlayers,
	getAvailablePlayersForTeam,
} from "@/features/teams/data/teamPlayers";
import {
	getTeamFundraisers,
	getAvailableFundraisersForTeam,
} from "@/features/fundraisers/data/fundraiserTeams";

type TeamPageProps = {
	params: Promise<{
		teamId: string;
	}>;
};

export default async function TeamPage({ params }: TeamPageProps) {
	const { teamId } = await params;

	const [team, players, fundraisers, availablePlayers, availableFundraisers] =
		await Promise.all([
			getTeamById(teamId),
			getTeamPlayers(teamId),
			getTeamFundraisers(teamId),
			getAvailablePlayersForTeam(teamId),
			getAvailableFundraisersForTeam(teamId),
		]);

	if (!team) {
		notFound();
	}

	return (
		<main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5 sm:px-6 sm:py-6">
			<TeamHeader team={team} playerCount={players.length} />

			<SummarySection
				playerCount={players.length}
				fundraiserCount={fundraisers.length}
			/>

			<TabSection
				teamId={team.id}
				players={players}
				availablePlayers={availablePlayers}
				fundraisers={fundraisers}
				availableFundraisers={availableFundraisers}
			/>
		</main>
	);
}
