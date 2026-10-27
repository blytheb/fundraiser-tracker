"use client";

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
	const router = useRouter();

	async function handleDelete() {
		try {
			await removeTeamFromFundraiser(fundraiser.id, teamId);
			router.refresh();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to remove player from team:", error);
		}
	}
	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={onOpenChange}
			title={`Remove ${fundraiser.name}`}
			description="Are you sure you want to remove this fundraiser from this team?"
			confirmLabel={`Yes, remove this ${fundraiser.name}`}
			onConfirm={handleDelete}
		/>
	);
}
