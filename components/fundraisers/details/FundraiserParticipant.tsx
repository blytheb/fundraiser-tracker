import React from "react";

import ManageFundraiserTeamsDialog from "@/components/fundraisers/forms/ManageFundraiserTeamsDialog";

import type { Fundraiser } from "@/types/fundraisers";
import type { Players } from "@/types/players";

type CardProps = {
	fundraiserId: string;
	selectedPlayers: Players[];
	eligiblePlayers: Players[];
};

export default function FundraiserParticipantCard({
	fundraiserId,
	selectedPlayers,
	eligiblePlayers,
}: CardProps) {
	return (
		<div>
			<p>Selected Players</p>
			{selectedPlayers.length === 0 ? (
				<div className="rounded-lg border">
					<div className="p-6 text-center text-muted-foreground">
						No players have been added.
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 itesm-stretch sm:grid-cols-3 gap-3">
					{selectedPlayers.map((player) => (
						<div key={player.id}>
							<p className="text-smtext-muted-foreground">
								{player.firstName} {player.lastName}
							</p>
						</div>
					))}
				</div>
			)}

			<ManageFundraiserTeamsDialog
				fundraiserId={fundraiserId}
				selectedPlayers={selectedPlayers}
				eligiblePlayers={eligiblePlayers}
			/>
		</div>
	);
}
