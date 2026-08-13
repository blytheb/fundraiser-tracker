import React from "react";
import { mockTeams } from "@/lib/mock-data/teams";
import { getPlayersByTeamId } from "@/lib/data/players";
import { getFundraisersByTeamId } from "@/lib/data/fundraisers";
import PlayerSmallCard from "@/components/players/PlayerSmallCard";
import SummaryBlock from "@/components/SummaryBlock";

type TeamPageProps = {
	params: Promise<{
		fundraiserId: string;
	}>;
};

export default async function TeamPage({ params }: TeamPageProps) {
	const { teamId } = await params;
	const team = mockTeams.find((team) => team.id === teamId);
	const players = getPlayersByTeamId(teamId);
	const fundraisers = getFundraisersByTeamId(teamId);

	if (!team) {
		return <div>Team Not Found</div>;
	}

	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{team.name}</h1>
					<p className="text-muted-foreground">Menehune team</p>
				</div>
				<div className="flex gap-2">
					<SummaryBlock value={players.length} label="Player Count" />
					<SummaryBlock value={fundraisers.length} label="Fundraiser Count" />
				</div>
			</div>
			<div>
				<h2>Roster</h2>
				{players.length === 0 ? (
					<div className="rounded-lg border">
						<div className="p-6 text-center text-muted-foreground">
							No players have been added to this team yet.
						</div>
					</div>
				) : (
					players.map((player) => (
						<PlayerSmallCard key={player.id} player={player} />
					))
				)}
			</div>
			<div className="pt-6">
				<h2>Fundraisers</h2>
				{fundraisers.length === 0 ? (
					<div className="rounded-lg border">
						<div className="p-6 text-center text-muted-foreground">
							No fundraisers
						</div>
					</div>
				) : (
					fundraisers.map((player) => (
						<PlayerSmallCard key={player.id} player={player} />
					))
				)}
			</div>
		</div>
	);
}
