"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { updateFundraiser } from "@/features/fundraisers/actions/fundraisers";

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

import type { Fundraiser } from "@prisma/client";

type EditFundraiserDialogProps = {
	fundraiser: Fundraiser;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function EditFundraiserDialog({
	fundraiser,
	open,
	onOpenChange,
}: EditFundraiserDialogProps) {
	const router = useRouter();
	const [name, setName] = useState(fundraiser.name);
	const [description, setDescription] = useState(fundraiser.description);
	const [startDate, setStartDate] = useState(
		fundraiser.startDate.toISOString().split("T")[0],
	);

	// useEffect(() => {
	// 	setName(fundraiser.name);
	// }, [fundraiser]);

	async function handleEdit() {
		try {
			await updateFundraiser(fundraiser.id, {
				name,
				description,
				startDate: new Date(startDate),
				status: "ACTIVE",
				distributionMethod: "EQUAL",
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
