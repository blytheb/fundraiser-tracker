"use client";

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
	const router = useRouter();

	async function handleDelete() {
		try {
			await deleteContribution(contribution.id);
			router.refresh();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete contribution:", error);
		}
	}

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Delete Contribution"
			description="Are you sure you want to delete this contribution?"
			confirmLabel="Yes, delete this contribution"
			onConfirm={handleDelete}
		/>
	);
}
