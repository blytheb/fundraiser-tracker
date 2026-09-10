import React from "react";

import AddPlayerToTeamDialog from "@/components/forms/teams/AddPlayerToTeamDialog";
import TeamPlayerList from "@/features/teams/TeamPlayerList";

import type { Player } from "@prisma/client";

type TabProps = {
	teamId: string;
	players: Player[];
	availablePlayers: Player[];
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
			<TeamPlayerList players={players} teamId={teamId} />
		</>
	);
}
