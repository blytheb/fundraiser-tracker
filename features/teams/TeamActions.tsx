"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Team } from "@prisma/client";

import { Button } from "@/components/ui/button";
import EditTeamDialog from "@/components/forms/teams/EditTeamDialog";
import DeleteTeamDialog from "@/components/dialogs/DeleteTeamDialog";

type TeamActionsProps = {
	team: Team;
};

// Visible Edit / Delete buttons for the team page (replaces the hidden ⋮ menu).
export default function TeamActions({ team }: TeamActionsProps) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<>
			<div className="flex items-center gap-1">
				<Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
					<Pencil />
					Edit
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="text-destructive"
					onClick={() => setDeleteOpen(true)}>
					<Trash2 />
					<span className="sr-only sm:not-sr-only">Delete</span>
				</Button>
			</div>

			<EditTeamDialog team={team} open={editOpen} onOpenChange={setEditOpen} />
			<DeleteTeamDialog team={team} open={deleteOpen} onOpenChange={setDeleteOpen} />
		</>
	);
}
