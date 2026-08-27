import React from "react";

import TeamHeader from "@/features/teams/TeamHeader";
import SummarySection from "@/features/teams/SummarySection";
import TabSection from "@/features/teams/TabSection";

import { getTeamById } from "@/features/teams/data/teams";
import {
	getTeamPlayers,
	getAvailablePlayersForTeam,
} from "@/features/teams/data/teamPlayers";
import { getTeamFundraisers } from "@/features/fundraisers/data/fundraiserTeams";

// import { getAllPlayers } from "@/lib/data/players";
// import { getTeamPlayers } from "@/lib/data/teamPlayers";
// import { getFundraisersByTeamId } from "@/lib/data/fundraisers";
// import FundraiserSmallCard from "@/components/fundraisers/FundraiserSmallCard";

type TeamPageProps = {
	params: Promise<{
		teamId: string;
	}>;
};

export default async function TeamPage({ params }: TeamPageProps) {
	const { teamId } = await params;
	const [team, players, fundraisers, availablePlayers] = await Promise.all([
		getTeamById(teamId),
		getTeamPlayers(teamId),
		getTeamFundraisers(teamId),
		getAvailablePlayersForTeam(teamId),
	]);

	if (!team) {
		return <div>Team Not Found</div>;
	}

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
			{/* Header */}
			<TeamHeader team={team} playerCount={players.length} />
			{/* Summary */}
			<SummarySection
				playerCount={players.length}
				fundraiserCount={fundraisers.length}
			/>
			{/* Tabs */}
			<TabSection
				teamId={team.id}
				players={players}
				availablePlayers={availablePlayers}
			/>
		</main>
	);
}
