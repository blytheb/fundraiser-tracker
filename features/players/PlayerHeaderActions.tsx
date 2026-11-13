"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Player } from "@prisma/client";

import { Button } from "@/components/ui/button";
import EditPlayerDialog from "@/components/forms/players/EditPlayerDialog";
import DeletePlayerDialog from "@/components/dialogs/DeletePlayerDialog";

// Visible Edit / Delete buttons for the admin player page.
export default function PlayerHeaderActions({ player }: { player: Player }) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<>
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
				Delete
			</Button>

			<EditPlayerDialog player={player} open={editOpen} onOpenChange={setEditOpen} />
			<DeletePlayerDialog player={player} open={deleteOpen} onOpenChange={setDeleteOpen} />
		</>
	);
}
