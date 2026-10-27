"use client";
import { useState } from "react";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";

import { useRouter } from "next/navigation";
import { removeTeamFromFundraiser } from "@/features/fundraisers/actions/fundraiserTeams";

import type { Fundraiser } from "@prisma/client";

type DialogProps = {
	teamId: string;
	fundraiser: Fundraiser;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function RemoveFundraiserFromTeamDialog({
	teamId,
	fundraiser,
	open,
	onOpenChange,
}: DialogProps) {
	const [error, setError] = useState("");
	const [isPending, setIsPending] = useState(false);
	const router = useRouter();

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) {
			setError("");
		}

		onOpenChange(nextOpen);
	}
	async function handleDelete() {
		setError("");
		setIsPending(true);

		try {
			await removeTeamFromFundraiser(fundraiser.id, teamId);
			router.refresh();
			handleOpenChange(false);
		} catch (error) {
			console.error("Failed to remove fundraiser from team:", error);
			setError(
				"Unable to remove this fundraiser from the team. Please try again.",
			);
		} finally {
			setIsPending(false);
		}
	}
	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={handleOpenChange}
			title={`Remove ${fundraiser.name}`}
			description="Are you sure you want to remove this fundraiser from this team?"
			confirmLabel={`Yes, remove this ${fundraiser.name}`}
			onConfirm={handleDelete}
			error={error}
			isPending={isPending}
		/>
	);
}
