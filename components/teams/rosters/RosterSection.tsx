"use client";

import { useState } from "react";
import RosterGrid from "@/components/teams/rosters/RosterGrid";
import TeamRosterDialog from "@/components/forms/TeamRosterDialog";

import type { Player } from "@/lib/types/player";

type RosterSectionProps = {
	teamId: string;
	players: Player[];
	allPlayers: Players[];
};

export default function RosterSection({
	teamId,
	players,
	allPlayers,
}: RosterSectionProps) {
	const [roster, setRoster] = useState(players);

	function handleUpdateRoster(updatedRoster: Player[]) {
		setRoster(updatedRoster);
	}

	return (
		<div className="pt-6">
			<div className="flex justify-between">
				<h2>Roster</h2>
				<TeamRosterDialog
					teamId={teamId}
					players={roster}
					allPlayers={allPlayers}
					onUpdateRoster={handleUpdateRoster}
				/>
			</div>
			<RosterGrid players={roster} />
		</div>
	);
}
