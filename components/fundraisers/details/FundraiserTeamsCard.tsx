import React from "react";

import type { Fundraiser } from "@/types/fundraisers";
import type { Team } from "@/types/teams";

type CardProps = {
	fundraiser: Fundraiser;
	activeTeams: Team[];
};

export default function FundraiserTeamsCard({
	fundraiser,
	activeTeams,
}: CardProps) {
	const [fundraisingTeams, setFundraisingTeams] = 

	return (
		<>
			{activeTeams.map((team) => (
				<h1 key={team.id}>{team.name}</h1>
			))}
			<h1>{fundraiser.name}</h1>
			<p>{fundraiser.startDate.toLocaleDateString()}</p>
			<p>{fundraiser.status}</p>
		</>
	);
}
