"use client";

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
	return (
		<div className="pt-6">
			<div className="flex justify-between">
				<h2>Roster</h2>
				<TeamRosterDialog
					teamId={teamId}
					players={players}
					allPlayers={allPlayers}
				/>
			</div>
			<RosterGrid players={players} />
		</div>
	);
}
