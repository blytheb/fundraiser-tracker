"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
	const [isSubmitting, setIsSubmitting] = useState(false);

	// useEffect(() => {
	// 	setName(fundraiser.name);
	// }, [fundraiser]);

	async function handleEdit() {
		setIsSubmitting(true);

		const result = await updateFundraiser(fundraiser.id, {
			name,
			description,
			startDate: new Date(startDate),
		});

		setIsSubmitting(false);

		if (!result.ok) {
			toast.error(result.error);
			return;
		}

		toast.success("Fundraiser updated");
		router.refresh();
		onOpenChange(false);
		setName("");
		setDescription("");
		setStartDate("");
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
						disabled={isSubmitting || !name.trim() || !startDate}>
						{isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
