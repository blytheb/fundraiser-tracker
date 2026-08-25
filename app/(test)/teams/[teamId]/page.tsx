import React from "react";

import TeamHeader from "@/components/teams/TeamHeader";
import SummarySection from "@/components/teams/SummarySection";
import TabSection from "@/components/teams/TabSection";

import { getTeamById } from "@/features/teams/data/teams";
import { getTeamPlayers } from "@/features/teams/data/teamPlayers";

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
	const [team, players] = await Promise.all([
		getTeamById(teamId),
		getTeamPlayers(teamId),
	]);

	if (!team) {
		return <div>Team Not Found</div>;
	}

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
			{/* <Button variant="ghost" size="sm">
				<Link href="/teams"> Back to All Teams</Link>
			</Button> */}

			{/* Header */}
			<TeamHeader team={team} playerCount={players.length} />
			{/* Summary */}
			<SummarySection />
			{/* Tabs */}
			<TabSection team={team} players={players} />
		</main>
	);
}
