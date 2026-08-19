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

import { saveFundraiserTeams } from "@/lib/actions/fundraiserTeams";

import type { Team } from "@/types/team";

type DialogProps = {
	fundraiserId: string;
	selectedTeams: Team[];
	activeTeams: Team[];
};

export default function EditFundraiserTeamsDialog({
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
				{/* <div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="firstName">Player First Name</Label>
						<Input
							id="firstName"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="lastName">Player Last Name</Label>
						<Input
							id="lastName"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						/>
					</div>
				</div> */}
				<DialogFooter>
					<Button type="button" onClick={handleSave}>
						Save Team Selection
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
