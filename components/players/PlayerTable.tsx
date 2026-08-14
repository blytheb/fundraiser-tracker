import React from "react";

import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import PlayerRow from "@/components/players/PlayerRow";
import type { Player } from "@/types/Player";

type PlayerTableProps = {
	players: PlayersWithTeams[];
	onEditPlayer: (player: Player) => void;
};

export default function PlayerTable({
	players,
	onEditPlayer,
}: PlayerTableProps) {
	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>First Name</TableHead>
						<TableHead>Last Name</TableHead>
						{/* <TableHead>Teams</TableHead> */}
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{players.map((player) => (
						<PlayerRow
							key={player.id}
							player={player}
							onEditPlayer={onEditPlayer}
						/>
					))}
				</TableBody>
			</Table>
		</>
	);
}
