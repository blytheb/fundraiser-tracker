"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { updatePlayer } from "@/lib/actions/players";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import type { Fundraiser } from "@/types/fundraiser";

type EditFundraiserDialogProps = {
	fundraiser: Fundraiser;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function EditFundraiserDialog({
	player,
	open,
	onOpenChange,
}: EditPlayerDialogProps) {
	const router = useRouter();
	const [name, setName] = useState(fundraiser.name);
	const [description, setDescription] = useState(fundraiser.description);
	const [startDate, setStartDate] = useState(fundraiser.startDate);

	// useEffect(() => {
	// 	setName(team.name);
	// }, [team]);

	async function handleEdit() {
		try {
			await updateFundraiser(player.id, {
				name,
				description,
				startDate,
				status: "ACTIVE",
			});
			router.refresh();
			onOpenChange(false);
			setName("");
			setDescription("");
			setStartDate("");
		} catch (error) {
			console.error("Failed to edit fundraiser:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit this Fundraiser</DialogTitle>
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
						<Label htmlFor="startDate">Fundraiser Date</Label>
						<Input
							id="startDate"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button onClick={handleEdit}>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
