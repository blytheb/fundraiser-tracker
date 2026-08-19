import React from "react";

import EditFundraiserTeamsDialog from "@/components/fundraisers/forms/EditFundraiserTeamsDialog";

import type { Fundraiser } from "@/types/fundraisers";
import type { Team } from "@/types/teams";

type CardProps = {
	fundraiserId: string;
	teams: Team[];
	activeTeams: Team[];
};

export default function FundraiserTeamsCard({
	fundraiserId,
	teams,
	activeTeams,
}: CardProps) {
	return (
		<div>
			<p>Active Teams</p>
			{activeTeams.length === 0 ? (
				<div> No teams</div>
			) : (
				activeTeams.map((team) => <h1 key={team.id}>{team.name}</h1>)
			)}

			<p>Participating Teams</p>
			{teams.length === 0 ? (
				<div> No teams</div>
			) : (
				teams.map((team) => <h1 key={team.id}>{team.name}</h1>)
			)}
			<EditFundraiserTeamsDialog
				fundraiserId={fundraiserId}
				teams={teams}
				activeTeams={activeTeams}
			/>
		</div>
	);
}
