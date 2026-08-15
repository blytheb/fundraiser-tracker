"use client";

import { useState, useEffect } from "react";

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

type DialogProps = {
	fundraiser: Fundraiser;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEditFundraiser: (player: Player) => void;
};

export default function EditFundraiserDialog({
	fundraiser,
	open,
	onOpenChange,
	onEditFundraiser,
}: DialogProps) {
	const [name, setName] = useState(fundraiser.name);

	// useEffect(() => {
	// 	setName(team.name);
	// }, [team]);

	function handleEdit() {
		const updatedFundraiser: Fundraiser = {
			...fundraiser,
			name,
		};

		onEditFundraiser(updatedFundraiser);
		onOpenChange(false);
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
				</div>

				<DialogFooter>
					<Button onClick={handleEdit}>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
