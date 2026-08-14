"use client";

import { useState, useEffect } from "react";

import {
	Dialog,
	DialogDescription,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import type { Team } from "@/types/team";

type DeleteTeamDialogProps = {
	team: Team;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleteTeam: (team: Team) => void;
};

export default function DeleteTeamDialog({
	team,
	open,
	onOpenChange,
	onDeleteTeam,
}: DeleteTeamDialogProps) {
	function handleDelete() {
		onDeleteTeam(team);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete {team.name}</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to delete this team?
				</DialogDescription>

				<DialogFooter>
					<Button onClick={handleDelete}>Yes, delete this team</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
