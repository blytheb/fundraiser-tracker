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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createFundraiser } from "@/app/(admin)/admin/seasons/[seasonId]/fundraisers/actions.ts";

type NewFundraiserDialogProps = {
	seasonId: string;
};

export default function NewFundraiserDialog({
	seasonId,
}: NewFundraiserDialogProps) {
	const [open, setOpen] = useState(false);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [fundraiserDate, setFundraiserDate] = useState("");
	const [notes, setNotes] = useState("");
	const [status, setStatus] = useState("DRAFT");
	const [distributionMethod, setDistributionMethod] = useState("EQUAL");

	async function handleCreate() {
		if (!name) {
			alert("Please enter a fundraiser name");
			return;
		}
		if (!fundraiserDate) {
			alert("Please enter a fundraiser date");
			return;
		}

		await createFundraiser(
			seasonId,
			name,
			description,
			fundraiserDate,
			notes,
			status as "DRAFT" | "ACTIVE" | "COMPLETED",
			distributionMethod as "EQUAL" | "CUSTOM",
		);

		setName("");
		setDescription("");
		setFundraiserDate("");
		setNotes("");
		setStatus("DRAFT");
		setDistributionMethod("EQUAL");
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
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="fundraiserDate">Fundraiser Date</Label>
						<Input
							id="fundraiserDate"
							type="date"
							value={fundraiserDate}
							onChange={(e) => setFundraiserDate(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="notes">Notes</Label>
						<Input
							id="notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="status">Status</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="DRAFT">Draft</SelectItem>
								<SelectItem value="ACTIVE">Active</SelectItem>
								<SelectItem value="COMPLETED">Completed</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="distirbutionMethod">Distribution Method</Label>
						<Select
							id="distributionMethod"
							value={distributionMethod}
							onValueChange={setDistributionMethod}>
							<SelectTrigger>
								<SelectValue placeholder="Select distribution method" />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="EQUAL">Equal</SelectItem>
								<SelectItem value="CUSTOM">Custom</SelectItem>
							</SelectContent>
						</Select>
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
