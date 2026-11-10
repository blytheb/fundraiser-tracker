"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTeam } from "@/features/teams/actions/teams";
import TeamForm from "@/components/forms/teams/TeamForm";
import { Plus } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AddTeamDialog() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [error, setError] = useState("");

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			setError("");
		}

		setOpen(nextOpen);
	}

	async function handleCreate() {
		setError("");
		const result = await createTeam({
			name,
			status: "IN_SEASON",
		});

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success("Team created");
		router.refresh();
		handleOpenChange(false);
		setName("");
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button>
						<Plus />
						Create New Team
					</Button>
				}></DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a New Team</DialogTitle>
				</DialogHeader>
				<TeamForm name={name} onNameChange={setName} />

				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}
				<DialogFooter>
					<Button type="button" onClick={handleCreate} disabled={!name.trim()}>
						Create Team
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
