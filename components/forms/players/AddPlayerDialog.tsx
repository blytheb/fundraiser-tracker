"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
	const [error, setError] = useState("");

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			setError("");
		}

		setOpen(nextOpen);
	}

	async function handleCreate() {
		setError("");
		const result = await createPlayer({
			firstName,
			lastName,
			status: true,
		});

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success("Player created");
		router.refresh();
		handleOpenChange(false);
		setFirstName("");
		setLastName("");
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
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

				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}
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
