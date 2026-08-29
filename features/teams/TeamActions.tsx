"use client";

import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreVertical } from "lucide-react";

import EditTeamDialog from "@/components/forms/teams/EditTeamDialog";
import DeleteTeamDialog from "@/components/forms/teams/DeleteTeamDialog";

import type { Team } from "@/types/team";

type TeamActionsProps = {
	team: Team;
};

export default function TeamActions({ team }: TeamActionsProps) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<>
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
						Edit Team
					</DropdownMenuItem>
					{/* <DropdownMenuItem
						onClick={(e) => {
							e.preventDefault();
							console.log("Edit Clicked");
							setEditOpen(true);
						}}>
						Change Status
					</DropdownMenuItem> */}
					<DropdownMenuItem
						onClick={(e) => {
							e.preventDefault();
							console.log("delete clicked");
							setDeleteOpen(true);
						}}
						className="text-destructive">
						Delete Team
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditTeamDialog team={team} open={editOpen} onOpenChange={setEditOpen} />

			<DeleteTeamDialog
				team={team}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</>
	);
}
