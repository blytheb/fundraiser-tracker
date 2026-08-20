import React from "react";
import TeamHeader from "@/components/teams/TeamHeader";

import { Badge } from "@/components/ui/badge";
import { getAllPlayers } from "@/lib/data/players";
import { getTeamById } from "@/lib/data/teams";
import { getTeamPlayers } from "@/lib/data/teamPlayers";
import { getFundraisersByTeamId } from "@/lib/data/fundraisers";
import FundraiserSmallCard from "@/components/fundraisers/FundraiserSmallCard";
import SummaryBlock from "@/components/SummaryBlock";
import RosterSection from "@/components/teams/rosters/RosterSection";

type TeamPageProps = {
	params: Promise<{
		teamId: string;
	}>;
};

export default async function TeamPage({ params }: TeamPageProps) {
	const { teamId } = await params;
	const team = await getTeamById(teamId);
	const players = await getTeamPlayers(teamId);
	const allPlayers = await getAllPlayers();
	// const fundraisers = getFundraisersByTeamId(teamId);

	if (!team) {
		return <div>Team Not Found</div>;
	}

	return (
		<div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
			<TeamHeader team={team} />
			{/* Summary */}
			{/* Upcoming Trip */}
			{/* Roster */}
			{/* Fundraising */}

			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{team.name}</h1>
					<p className="text-muted-foreground">Menehune team</p>
				</div>
				<div className="flex gap-2">
					<SummaryBlock value={players.length} label="Players" />
					{/* <SummaryBlock value={fundraisers.length} label="Fundraisers" /> */}
				</div>
			</div>
			<div>
				<div className="p-6 text-muted-foreground border">
					<h1>Trip to Japan</h1>
					<p>June 1, 2027 - June 9,2027</p>
					<p>Goal: $1,500 per player</p>
					<Badge variant="secondary">23054 Days away</Badge>
				</div>
			</div>
			<RosterSection
				teamId={teamId}
				players={players}
				allPlayers={allPlayers}
			/>
			{/* <div className="pt-6">
				<h2>Fundraisers</h2>
				{fundraisers.length === 0 ? (
					<div className="rounded-lg border">
						<div className="p-6 text-center text-muted-foreground">
							No fundraisers
						</div>
					</div>
				) : (
					fundraisers.map((fundraiser) => (
						<FundraiserSmallCard key={fundraiser.id} fundraiser={fundraiser} />
					))
				)}
			</div> */}
		</div>
	);
}
