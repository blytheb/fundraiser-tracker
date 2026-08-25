import React from "react";
import TeamHeader from "@/components/teams/TeamHeader";

import { Badge } from "@/components/ui/badge";
import { getAllPlayers } from "@/lib/data/players";
import { getTeamById } from "@/lib/data/teams";
import { getTeamPlayers } from "@/lib/data/teamPlayers";
import { getFundraisersByTeamId } from "@/lib/data/fundraisers";
import FundraiserSmallCard from "@/components/fundraisers/FundraiserSmallCard";
import TabSection from "@/components/teams/TabSection";

import SummarySection from "@/components/teams/SummarySection";

type TeamPageProps = {
	params: Promise<{
		teamId: string;
	}>;
};

export default async function TeamPage({ params }: TeamPageProps) {
	const { teamId } = await params;
	const team = await getTeamById(teamId);

	if (!team) {
		return <div>Team Not Found</div>;
	}
	// const players = await getTeamPlayers(teamId);
	// const allPlayers = await getAllPlayers();
	// const fundraisers = getFundraisersByTeamId(teamId);

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
			{/* <Button variant="ghost" size="sm">
				<Link href="/teams"> Back to All Teams</Link>
			</Button> */}
			<TeamHeader team={team} />
			{/* Summary */}
			<SummarySection />

			{/* Tabs */}
			<TabSection team={team} />
		</main>
	);
}
