"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTeam } from "@/features/teams/actions/teams";
import TeamForm from "@/components/forms/teams/TeamForm";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { Team } from "@prisma/client";

type EditTeamDialogProps = {
	team: Team;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function EditTeamDialog({
	team,
	open,
	onOpenChange,
}: EditTeamDialogProps) {
	const router = useRouter();
	const [name, setName] = useState(team.name);

	async function handleEdit() {
		try {
			await updateTeam(team.id, {
				name,
				status: team.status,
				imageUrl: team.imageUrl,
			});
			router.refresh();
			onOpenChange(false);
			setName("");
		} catch (error) {
			console.error("Failed to edit team:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit this team</DialogTitle>
				</DialogHeader>

				<TeamForm name={name} onNameChange={setName} />

				<DialogFooter>
					<Button type="button" onClick={handleEdit} disabled={!name.trim()}>
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
