"use client";

import { useState, useEffect } from "react";

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
	onDeletePlayer: (player: Player) => void;
};

export default function DeletePlayerDialog({
	player,
	open,
	onOpenChange,
	onDeletePlayer,
}: DeletePlayerDialogProps) {
	function handleDelete() {
		onDeletePlayer(player);
		onOpenChange(false);
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
