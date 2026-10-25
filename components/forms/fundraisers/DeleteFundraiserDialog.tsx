"use client";

import { useRouter } from "next/navigation";
import { deleteFundraiser } from "@/features/fundraisers/actions/fundraisers";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import type { Fundraiser } from "@prisma/client";

type DeleteFundraiserDialogProps = {
	fundraiser: Fundraiser;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function DeleteFundraiserDialog({
	fundraiser,
	open,
	onOpenChange,
}: DeleteFundraiserDialogProps) {
	const router = useRouter();

	async function handleDelete() {
		try {
			await deleteFundraiser(fundraiser.id);
			router.refresh();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete fundraiser:", error);
		}
	}

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={onOpenChange}
			title={`Delete ${fundraiser.name}`}
			description="Are you sure you want to delete this fundraiser?"
			confirmLabel="Yes, delete this fundraiser"
			onConfirm={handleDelete}
		/>
	);
}
