"use client";

import React from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { saveFundraiserTeams } from "@/features/fundraisers/actions/save-fundraiser-teams";

import type { Team } from "@prisma/client";

type DialogProps = {
	fundraiserId: string;
	selectedTeams: Team[];
	activeTeams: Team[];
};

export default function ManageFundraiserTeamsDialog({
	fundraiserId,
	selectedTeams,
	activeTeams,
}: DialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(
		selectedTeams.map((team) => team.id),
	);
	async function handleSave() {
		setIsSaving(true);
		const result = await saveFundraiserTeams(fundraiserId, selectedTeamIds);
		setIsSaving(false);

		if (!result.ok) {
			toast.error(result.error);
			return;
		}

		toast.success("Teams updated");
		router.refresh();
		setOpen(false);
	}

	function handleToggle(teamId: string) {
		setSelectedTeamIds((current) =>
			current.includes(teamId)
				? current.filter((id) => id !== teamId)
				: [...current, teamId],
		);
	}

	function handleOpenChange(value: boolean) {
		if (value) {
			setSelectedTeamIds(selectedTeams.map((team) => team.id));
		}

		setOpen(value);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button>
						<Plus />
						Edit Teams
					</Button>
				}></DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Team Selection</DialogTitle>
				</DialogHeader>
				{activeTeams.map((team) => (
					<div key={team.id} className="flex items-center gap-3">
						<Checkbox
							id={team.id}
							checked={selectedTeamIds.includes(team.id)}
							onCheckedChange={() => handleToggle(team.id)}
						/>
						<Label htmlFor={team.id}>{team.name}</Label>
					</div>
				))}

				<DialogFooter>
					<Button type="button" onClick={handleSave} disabled={isSaving}>
						{isSaving ? "Saving..." : "Save Team Selection"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
