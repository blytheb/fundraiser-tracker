"use client";

import { useState, useEffect } from "react";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import type { Player } from "@/types/player";

type EditPlayerDialogProps = {
	player: Player;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEditPlayer: (player: Player) => void;
};

export default function EditPlayerDialog({
	player,
	open,
	onOpenChange,
	onEditPlayer,
}: EditPlayerDialogProps) {
	const [firstName, setFirstName] = useState(player.firstName);
	const [lastName, setLastName] = useState(player.lastName);

	// useEffect(() => {
	// 	setName(team.name);
	// }, [team]);

	function handleEdit() {
		const updatedPlayer: Player = {
			...player,
			firstName,
			lastName,
		};

		onEditPlayer(updatedPlayer);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit this Player</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="firstName">Player First Name</Label>
						<Input
							id="firstName"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="lastName">Player Last Name</Label>
						<Input
							id="lastName"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button onClick={handleEdit}>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
