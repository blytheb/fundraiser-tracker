"use client";

import React from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createFundraiser } from "@/features/fundraisers/actions/fundraisers";
import FundraiserForm from "@/components/forms/fundraisers/FundraiserForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function AddFundraiserDialog() {
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [startDate, setStartDate] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// const activeTeams = getActiveTeams();

	async function handleCreate() {
		setIsSubmitting(true);

		const result = await createFundraiser({
			name,
			description,
			startDate: new Date(startDate),
		});

		setIsSubmitting(false);

		if (!result.ok) {
			toast.error(result.error);
			return;
		}

		toast.success("Fundraiser created");
		router.refresh();
		setOpen(false);
		setName("");
		setDescription("");
		setStartDate("");
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button>
						<Plus />
						Add Fundraiser
					</Button>
				}></DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a Fundraiser</DialogTitle>
					<DialogDescription>
						Create a fundraisers for this season.
					</DialogDescription>
				</DialogHeader>

				<FundraiserForm
					name={name}
					description={description}
					startDate={startDate}
					onNameChange={setName}
					onDescriptionChange={setDescription}
					onStartDateChange={setStartDate}
				/>

				<DialogFooter>
					<Button
						type="button"
						onClick={handleCreate}
						disabled={isSubmitting || !name.trim() || !startDate}>
						{isSubmitting ? "Creating..." : "Create Fundraiser"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
