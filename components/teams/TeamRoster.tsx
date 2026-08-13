import React from "react";
import PlayerSmallCard from "@/components/players/PlayerSmallCard";
import type { Player } from "@/lib/types/player";

type TeamRosterProps = {
	players: Player[];
};

export default function TeamRoster({ players }: TeamRosterProps) {
	return players.length === 0 ? (
		<div className="rounded-lg border">
			<div className="p-6 text-center text-muted-foreground">
				No players have been added to this team yet.
			</div>
		</div>
	) : (
		<div className="grid grid-cols-1 itesm-stretch sm:grid-cols-3 gap-3">
			{players.map((player) => (
				<PlayerSmallCard key={player.id} player={player} />
			))}
		</div>
	);
}
