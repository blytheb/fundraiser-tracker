"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createPlayer } from "@/features/players/actions/players";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PlayerForm from "@/components/forms/players/PlayerForm";

export default function AddPlayerDialog() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

	async function handleCreate() {
		try {
			await createPlayer({
				firstName,
				lastName,
				status: true,
			});
			router.refresh();
			setOpen(false);
			setFirstName("");
			setLastName("");
		} catch (error) {
			console.error("Failed to create player:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button>
						<Plus />
						Add Player
					</Button>
				}></DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a New Player</DialogTitle>
				</DialogHeader>
				<PlayerForm
					firstName={firstName}
					lastName={lastName}
					onFirstNameChange={setFirstName}
					onLastNameChange={setLastName}
				/>
				<DialogFooter>
					<Button
						type="button"
						onClick={handleCreate}
						disabled={!firstName.trim() || !lastName.trim()}>
						Create Player
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
