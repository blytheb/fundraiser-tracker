"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { deletePlayer } from "@/lib/actions/players";

import {
	Dialog,
	DialogDescription,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { Player } from "@/types/player";

type DeletePlayerDialogProps = {
	player: Player;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function DeletePlayerDialog({
	player,
	open,
	onOpenChange,
}: DeletePlayerDialogProps) {
	const router = useRouter();

	async function handleDelete() {
		try {
			await deletePlayer(player.id);
			router.refresh();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete player:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Delete {player.firstName} {player.lastName}
					</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to delete this player?
				</DialogDescription>

				<DialogFooter>
					<Button onClick={handleDelete}>Yes, delete this player</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
