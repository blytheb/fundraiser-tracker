"use client";

import React from "react";
import { useRouter } from "next/navigation";
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

	async function handleCreate() {
		try {
			await createTeam({
				name,
				status: "IN_SEASON",
			});
			router.refresh();
			setOpen(false);
			setName("");
		} catch (error) {
			console.error("Failed to create team:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
				<DialogFooter>
					<Button type="button" onClick={handleCreate} disabled={!name.trim()}>
						Create Team
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
