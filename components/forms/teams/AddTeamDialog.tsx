"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/features/teams/actions/teams";

import { CirclePlus } from "lucide-react";
import { Plus } from "lucide-react";

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
