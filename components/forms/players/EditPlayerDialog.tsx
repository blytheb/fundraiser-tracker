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

import type { Player } from "@prisma/client";
import PlayerForm from "@/components/forms/players/PlayerForm";

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
				imageUrl: player.imageUrl ?? "",
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

				<PlayerForm
					firstName={firstName}
					lastName={lastName}
					onFirstNameChange={setFirstName}
					onLastNameChange={setLastName}
				/>

				<DialogFooter>
					<Button onClick={handleEdit}>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
