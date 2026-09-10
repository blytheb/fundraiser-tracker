import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import PlayerActions from "@/features/players/PlayerActions";
import type { Player } from "@prisma/client";

type PlayerRowProps = {
	player: Player;
};

export default function PlayerRow({ player }: PlayerRowProps) {
	return (
		<TableRow>
			<TableCell>{player.firstName}</TableCell>
			<TableCell>{player.lastName}</TableCell>
			{/* <TableCell>
				<div className="flex flew-wrap gap-1">
					{player.teams.map((team) => (
						<Badge key={team.id} variant="secondary">
							{team.name}
						</Badge>
					))}
				</div>
			</TableCell> */}
			<TableCell className="text-right">
				<PlayerActions player={player} />
			</TableCell>
		</TableRow>
	);
}
