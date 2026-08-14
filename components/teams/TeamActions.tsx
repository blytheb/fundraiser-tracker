"use client";

import { MoreVertical } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import EditTeamDialog from "@/components/forms/EditTeamDialog";
// import DeleteTeamDialog from "@/components/forms/DeleteTeamDialog";

import type { Team } from "@/types/team";

type TeamActionsProps = {
	team: Team;
	onEditTeam: (team: Team) => void;
	// onDeleteTeam: (teamId: string) => void;
};

export default function TeamActions({
	team,
	onEditTeam,
	// onDeleteTeam,
}: TeamActionsProps) {
	const [editOpen, setEditOpen] = useState(false);

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
					{/* <DeleteTeamDialog team={team} onDeleteTeam={onDeleteTeam}>
					<DropdownMenuItem
						onSelect={(event) => event.preventDefault()}
						className="text-destructive">
						Delete Team
					</DropdownMenuItem>
				</DeleteTeamDialog> */}
				</DropdownMenuContent>
			</DropdownMenu>

			<EditTeamDialog
				team={team}
				open={editOpen}
				onOpenChange={setEditOpen}
				onEditTeam={onEditTeam}
			/>
		</>
	);
}
