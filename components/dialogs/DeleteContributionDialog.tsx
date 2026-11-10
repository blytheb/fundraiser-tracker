"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteContribution } from "@/features/fundraisers/actions/contributions";
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

		const result = await deleteContribution(contribution.id);
		setIsPending(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success("Contribution deleted");
		router.refresh();
		handleOpenChange(false);
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
