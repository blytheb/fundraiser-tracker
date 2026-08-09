"use client";

import React from "react";
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

export default function NewFundraiserDialog() {
	const [open, setOpen] = useState(false);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [fundraiserDate, setFundraiserDate] = useState("");
	const [notes, setNotes] = useState("");

	async function handleCreate() {
		console.log({
			name,
			description,
			fundraiserDate,
			notes,
		});

		setOpen(false);
	}
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>New Fundraiser</DialogTrigger>
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
						<Label htmlFor="name">Description</Label>
						<Textarea
							id="name"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="year">Fundraiser Date</Label>
						<Input
							id="date"
							type="number"
							value={fundraiserDate}
							onChange={(e) => setFundraiserDate(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="name">Notes</Label>
						<Input
							id="name"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
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
