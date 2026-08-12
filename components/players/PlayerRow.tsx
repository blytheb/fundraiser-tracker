import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
	TableCell,
	TableRow,
} from "@/components/ui/table";

type PlayerRowProps = {
	player: PlayerWithTeams;
}

export default function PlayerRow({player,}: PlayerRowProps) {
  return (
		<TableRow>
			<TableCell>{player.firstName}</TableCell>
			<TableCell>{player.lastName}</TableCell>
			<TableCell>
				<div className="flex flew-wrap gap-1">
					{player.teams.map((team) => (
						<Badge key={team.id} variant="secondary">{team.name}</Badge>
					))}
				</div>
			</TableCell>
			<TableCell className="text-right">
				<div className="flex justify-end gap-1">
					<Button variant="ghost" size="icon">
						<Eye />
					</Button>

					<Button variant="ghost" size="icon">
						<Pencil />
					</Button>

					<Button variant="ghost" size="icon">
						<Trash2 />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}
