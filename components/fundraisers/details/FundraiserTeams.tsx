import React from "react";

import EditFundraiserTeamsDialog from "@/components/fundraisers/forms/EditFundraiserTeamsDialog";

import type { Fundraiser } from "@/types/fundraisers";
import type { Team } from "@/types/teams";

type CardProps = {
	fundraiserId: string;
	selectedTeams: Team[];
	activeTeams: Team[];
};

export default function FundraiserTeamsCard({
	fundraiserId,
	selectedTeams,
	activeTeams,
}: CardProps) {
	return (
		<div>
			<p>Active Teams</p>
			{selectedTeams.length === 0 ? (
				<div className="rounded-lg border">
					<div className="p-6 text-center text-muted-foreground">
						No teams have been added.
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 itesm-stretch sm:grid-cols-3 gap-3">
					{selectedTeams.map((team) => (
						<div key={team.id}>
							<p className="text-smtext-muted-foreground">{team.name}</p>
						</div>
					))}
				</div>
			)}

			<EditFundraiserTeamsDialog
				fundraiserId={fundraiserId}
				selectedTeams={selectedTeams}
				activeTeams={activeTeams}
			/>
		</div>
	);
}
