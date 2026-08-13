"use client";

import React from "react";

import { getActiveTeams } from "@/lib/data/teams";
// import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export default function AddFundraiserButton() {
	// const router = useRouter();

	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [startDate, setStartDate] = useState("");

	const activeTeams = getActiveTeams();

	function handleCreate() {
		console.log("create fundaiser");
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger> Add Fundraiser </DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a Fundraiser</DialogTitle>
					<DialogDescription>
						Create a fundraisers for this season.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name">Fundraiser Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Fundraiser Description</Label>
						<Input
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="startDate">Date of Fundraiser</Label>
						<Input
							id="startDate"
							type="Date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button type="button" onClick={handleCreate}>
						Create Fundraiser
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
