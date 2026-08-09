"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createSeason } from "@/app/(admin)/admin/seasons/actions";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export default function NewSeasonDialog() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [year, setYear] = useState("");

	async function handleCreate() {
		if (!name || !year) return;

		await createSeason(name, Number(year));

		setName("");
		setYear("");
		setOpen(false);
	}
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>New Season</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Season</DialogTitle>
					<DialogDescription>
						Create a season to organizae your players and fundraisers.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name">Season Name</Label>
						<Input
							id="name"
							placeholder="2026-2027 Basketball Season"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="year">Year</Label>
						<Input
							id="year"
							type="number"
							value={year}
							onChange={(e) => setYear(e.target.value)}
							placeholder="2026"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" onClick={handleCreate}>
						Create Season
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
