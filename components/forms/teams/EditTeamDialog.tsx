"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTeam } from "@/features/teams/actions/teams";

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

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name">Team Name</Label>

						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
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
