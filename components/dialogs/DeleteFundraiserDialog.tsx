"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
	const [error, setError] = useState("");
	const [isPending, setIsPending] = useState(false);
	const router = useRouter();

	async function handleDelete() {
		setError("");
		setIsPending(true);

		const result = await deleteFundraiser(fundraiser.id);
		setIsPending(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success("Fundraiser deleted");
		router.refresh();
		onOpenChange(false);
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
			title={`Delete ${fundraiser.name}`}
			description="Are you sure you want to delete this fundraiser?"
			confirmLabel="Yes, delete this fundraiser"
			onConfirm={handleDelete}
			error={error}
			isPending={isPending}
		/>
	);
}
