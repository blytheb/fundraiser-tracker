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

import type { Team } from "@/types/team";

type EditTeamDialogProps = {
	team: Team;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEditTeam: (team: Team) => void;
};

export default function EditTeamDialog({
	team,
	open,
	onOpenChange,
	onEditTeam,
}: EditTeamDialogProps) {
	const [name, setName] = useState(team.name);

	useEffect(() => {
		setName(team.name);
	}, [team]);

	function handleEdit() {
		const updatedTeam: Team = {
			...team,
			name,
		};

		onEditTeam(updatedTeam);
		onOpenChange(false);
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
