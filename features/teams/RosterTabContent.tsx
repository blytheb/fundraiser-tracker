import React from "react";

import AddPlayerToTeamDialog from "@/components/forms/teams/AddPlayerToTeamDialog";
import RosterList from "@/features/teams/RosterList";

import type { Player } from "@prisma/client";

type TabProps = {
	teamId: string;
	players: Player[];
	avaiablePlayers: Player[];
};

export default function RosterTabContent({
	teamId,
	players,
	availablePlayers,
}: TabProps) {
	return (
		<>
			<div className="mb-3 flex items-center justify-between">
				<div>
					<h2 className="font-semibold">Roster</h2>

					<p className="text-sm text-muted-foreground">
						{players.length} players
					</p>
				</div>

				<AddPlayerToTeamDialog
					teamId={teamId}
					availablePlayers={availablePlayers}
				/>
			</div>
			<RosterList players={players} />

			{/* <div>
				{players.map((player) => (
					<ListItemWithAvatar
						key={player.id}
						player={player}
						actions={<TeamPlayerActions player={player} teamId={teamId} />}
					/>
				))}
			</div> */}
		</>
	);
}
