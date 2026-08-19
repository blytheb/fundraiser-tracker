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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import type { Team } from "@/types/team";

type DialogProps = {
	fundraiserId: string;
	teams: Team[];
	activeTeams: Team[];
};

export default function EditFundraiserTeamsDialog({
	fundraiserId,
	teams,
	activeTeams,
}: DialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(
		activeTeams.map((team) => team.id),
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

	function toggleTeam(teamId: string) {
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
				<div>
					{activeTeams.map((activeTeam) => (
						<p key={activeTeam.id}>{activeTeam.name}</p>
					))}
				</div>
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
