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

import EditPlayerDialog from "@/components/players/forms/EditPlayerDialog";
import RemovePlayerFromTeamDialog from "@/components/forms/teams/RemovePlayerFromTeamDialog";

import type { Player } from "@/types/player";

type ActionsProps = {
	player: Player;
	teamId: string;
};

export default function TeamPlayerActions({ player, teamId }: ActionsProps) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<>
			{/* Smaller Screens Collapsed Actions */}
			<div className="lg:hidden">
				<DropdownMenu>
					<DropdownMenuTrigger>
						<MoreVertical />
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								console.log("Edit Clicked");
								setEditOpen(true);
							}}>
							Edit Player
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								console.log("delete clicked");
								setDeleteOpen(true);
							}}
							className="text-destructive">
							Remove Player from Team
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Large Screen 3 action buttons */}
			<div className="hidden lg:flex items-center gap-1">
				{/* <div className="flex items-center gap-1"> */}
				<Button variant="ghost" size="icon">
					<Link href={`/players/${player.id}`}>
						<Eye />
					</Link>
				</Button>

				<Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
					<Pencil />
				</Button>

				<Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)}>
					<Trash2 />
				</Button>
			</div>

			<EditPlayerDialog
				player={player}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>

			<RemovePlayerFromTeamDialog
				player={player}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</>
	);
}
