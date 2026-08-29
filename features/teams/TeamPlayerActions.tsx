"use client";

import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { MoreVertical } from "lucide-react";

import Link from "next/link";

// import EditPlayerDialog from "@/components/players/forms/EditPlayerDialog";
import RemovePlayerFromTeamDialog from "@/components/forms/teams/RemovePlayerFromTeamDialog";

import type { Player } from "@/types/player";

type ActionsProps = {
	player: Player;
	teamId: string;
};

export default function TeamPlayerActions({ player, teamId }: ActionsProps) {
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<>
			{/* Smaller Screens Collapsed Actions */}
			<div>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<MoreVertical />
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						<Link href={`/players/${player.id}`}>View Player</Link>
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								console.log("delete clicked");
								setDeleteOpen(true);
							}}
							className="text-destructive">
							Remove
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<RemovePlayerFromTeamDialog
				player={player}
				teamId={teamId}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</>
	);
}
