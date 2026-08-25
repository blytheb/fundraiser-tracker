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

	if (!team) {
		return <div>Team Not Found</div>;
	}
	const players = await getTeamPlayers(teamId);
	const allPlayers = await getAllPlayers();
	// const fundraisers = getFundraisersByTeamId(teamId);

	return (
		<div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
			{/* <Button variant="ghost" size="sm">
				<Link href="/teams"> Back to All Teams</Link>
			</Button> */}
			<TeamHeader team={team} />
			{/* Summary */}
			<section>
				<h2 className="mb-3 text-lg font-semibold">Summary</h2>

				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<SummaryBlock value={players.length} label="Players" />

					<SummaryBlock value="3" label="Upcoming Events" />

					<SummaryBlock value="$2,450" label="Fundraised" />
				</div>
			</section>
			{/* Upcoming Trip */}
			<section>
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-lg font-semibold">Upcoming Trip</h2>
				</div>

				<div className="rounded-lg border p-4 sm:p-6">
					<div className="space-y-2">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h3 className="font-semibold">Trip to Japan</h3>

								<p className="text-sm text-muted-foreground">June 1–9, 2027</p>
							</div>

							<Badge variant="secondary">Upcoming</Badge>
						</div>

						<p className="text-sm text-muted-foreground">
							Goal: $1,500 per player
						</p>
					</div>
				</div>
			</section>

			{/* Roster */}
			<section>
				<div className="mb-3">
					<h2 className="text-lg font-semibold">Roster</h2>
				</div>

				<RosterSection
					teamId={teamId}
					players={players}
					allPlayers={allPlayers}
				/>
			</section>
			{/* Fundraising */}
			<section>
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-lg font-semibold">Fundraising</h2>
				</div>

				<div className="rounded-lg border p-4 sm:p-6">
					<p className="text-sm text-muted-foreground">
						No fundraising information yet.
					</p>
				</div>
			</section>
		</div>
	);
}
