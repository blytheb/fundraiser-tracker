"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { updateFundraiser } from "@/features/fundraisers/actions/fundraisers";
import FundraiserForm from "@/components/forms/fundraisers/FundraiserForm";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

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
						onClick={handleEdit}
						disabled={!name.trim() || !startDate}>
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
