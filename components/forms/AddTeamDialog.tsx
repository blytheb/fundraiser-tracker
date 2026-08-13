"use client";

import React from "react";
import { CirclePlus } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type AddTeamDialogProps = {
	onAddTeam: (team: Team) => void;
};

export default function AddTeamDialog({ onAddTeam }: AddTeamDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");

	function handleCreate() {
		const id = crypto.randomUUID();
		const newTeam: Team = {
			id,
			name,
			status: "IN_SEASON",
			imageUrl: `https://robohash.org/${id}`,
		};
		onAddTeam(newTeam);
		setOpen(false);
		setName("");
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<Card className="flex h-[250px] min-h-full w-full cursor-pointer items-center justify-center overflow-hidden">
					<CardContent className="flex flex-col items-center gap-2">
						<CirclePlus className="h-10 w-10" />

						<CardTitle>Add a Team</CardTitle>
					</CardContent>
				</Card>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a New Team</DialogTitle>
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
					<Button type="button" onClick={handleCreate}>
						Create Team
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
