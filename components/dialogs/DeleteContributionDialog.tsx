"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteContribution } from "@/features/fundraisers/actions/fundraiserContributions";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";

import type { FundraiserContributionListItem } from "@/features/fundraisers/types";

type DialogProps = {
	contribution: FundraiserContributionListItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function DeleteContributionDialog({
	contribution,
	open,
	onOpenChange,
}: DialogProps) {
	const [error, setError] = useState("");
	const [isPending, setIsPending] = useState(false);
	const router = useRouter();

	async function handleDelete() {
		setError("");
		setIsPending(true);

		try {
			await deleteContribution(contribution.id);
			router.refresh();
			handleOpenChange(false);
		} catch (error) {
			console.error("Failed to delete contribution:", error);
			setError("Unable to delete this contribution. Please try again.");
		} finally {
			setIsPending(false);
		}
	}
	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			setError("");
		}

		onOpenChange(nextOpen);
	}

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Delete Contribution"
			description="Are you sure you want to delete this contribution?"
			confirmLabel="Yes, delete this contribution"
			onConfirm={handleDelete}
			error={error}
			isPending={isPending}
		/>
	);
}
