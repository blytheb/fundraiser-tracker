import React from "react";

import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import PlayerRow from "@/components/players/PlayerRow";

type PlayerTableProps = {
	players: PlayersWithTeams[];
};

export default function PlayerTable({ players }: PlayerTableProps) {
	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>First Name</TableHead>
						<TableHead>Last Name</TableHead>
						<TableHead>Teams</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{players.map((player) => (
						<PlayerRow key={player.id} player={player} />
					))}
				</TableBody>
			</Table>
		</>
	);
}
