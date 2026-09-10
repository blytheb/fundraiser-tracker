"use client";

import React from "react";

import { useRouter } from "next/navigation";

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
import { Input } from "@/components/ui/input";

import { saveFundraiserTeams } from "@/features/fundraisers/actions/fundraiserTeams";

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
	const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(
		selectedTeams.map((team) => team.id),
	);
	async function handleSave() {
		try {
			await saveFundraiserTeams(fundraiserId, selectedTeamIds);
			router.refresh();
			setOpen(false);
		} catch (error) {
			console.error("Failed to add team to fundraiser", error);
		}
	}

	function handleToggle(teamId: string) {
		setSelectedTeamIds((current) =>
			current.includes(teamId)
				? current.filter((id) => id !== teamId)
				: [...current, teamId],
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
					<div key={team.id}>
						<Input
							type="checkbox"
							checked={selectedTeamIds.includes(team.id)}
							onChange={() => handleToggle(team.id)}
						/>

						{team.name}
					</div>
				))}

				<DialogFooter>
					<Button type="button" onClick={handleSave}>
						Save Team Selection
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
