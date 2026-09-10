"use client";

import RosterGrid from "@/components/resources/RosterGrid";
// import TeamRosterDialog from "@/components/teams/rosters/TeamRosterDialog";

import type { Player } from "@prisma/client";

type RosterSectionProps = {
	teamId: string;
	players: Player[];
	allPlayers: Player[];
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
				{/* <TeamRosterDialog
					teamId={teamId}
					players={players}
					allPlayers={allPlayers}
				/> */}
			</div>
			<RosterGrid players={players} />
		</div>
	);
}
