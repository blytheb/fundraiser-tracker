"use client";

import { MoreVertical } from "lucide-react";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import EditPlayerDialog from "@/components/forms/EditPlayerDialog";
// import DeleteTeamDialog from "@/components/forms/DeleteTeamDialog";

import type { Player } from "@/types/player";

type PlayerActionsProps = {
	player: Player;
	onEditPlayer: (player: PLayer) => void;
	// onDeleteTeam: (playerId: string) => void;
};

export default function PlayerActions({
	player,
	onEditPlayer,
	// onDeleteTeam,
}: PlayerActionsProps) {
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
								// setEditOpen(true);
							}}>
							Edit Team
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								console.log("delete clicked");
								// setDeleteOpen(true);
							}}
							className="text-destructive">
							Delete Team
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* <EditTeamDialog
				team={team}
				open={editOpen}
				onOpenChange={setEditOpen}
				onEditTeam={onEditTeam}
				/>

				<DeleteTeamDialog
					team={team}
					open={deleteOpen}
					onOpenChange={setDeleteOpen}
					onDeleteTeam={onDeleteTeam}
				/> */}
			</div>

			{/* Large Screen 3 action buttons */}
			{/* <div className="hidden lg:flex items-center gap-1"> */}
			<div className="flex items-center gap-1">
				<Button variant="ghost" size="icon">
					<Link href={`/players/${player.id}`}>
						<Eye />
					</Link>
				</Button>

				<Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
					<Pencil />
				</Button>

				<Button variant="ghost" size="icon">
					<Trash2 />
				</Button>
			</div>

			<EditPlayerDialog
				player={player}
				open={editOpen}
				onOpenChange={setEditOpen}
				onEditPlayer={onEditPlayer}
			/>

			{/* <DeletePlayerDialog
				team={team}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				onDeleteTeam={onDeleteTeam}
			/> */}
		</>
	);
}
