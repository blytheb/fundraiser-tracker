import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import PlayerActions from "@/components/players/PlayerActions";

type PlayerRowProps = {
	player: PlayerWithTeams;
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
