"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { updatePlayer } from "@/features/players/actions/players";

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

import type { Player } from "@prisma/client";

type EditPlayerDialogProps = {
	player: Player;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function EditPlayerDialog({
	player,
	open,
	onOpenChange,
}: EditPlayerDialogProps) {
	const router = useRouter();
	const [firstName, setFirstName] = useState(player.firstName);
	const [lastName, setLastName] = useState(player.lastName);

	// useEffect(() => {
	// 	setName(team.name);
	// }, [team]);

	async function handleEdit() {
		try {
			await updatePlayer(player.id, {
				firstName,
				lastName,
				status: player.status,
				imageUrl: player.imageUrl ?? undefined,
			});
			router.refresh();
			onOpenChange(false);
			setFirstName("");
			setLastName("");
		} catch (error) {
			console.error("Failed to edit player:", error);
		}
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
