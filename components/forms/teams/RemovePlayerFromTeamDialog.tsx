"use client";

import { useState } from "react";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import { useRouter } from "next/navigation";
import { removePlayerFromTeam } from "@/features/teams/actions/remove-player-from-team";

import type { Player } from "@prisma/client";

type RemovePlayerFromTeamDialogProps = {
	teamId: string;
	player: Player;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function RemovePlayerFromTeamDialog({
	teamId,
	player,
	open,
	onOpenChange,
}: RemovePlayerFromTeamDialogProps) {
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
			await removePlayerFromTeam(teamId, player.id);
			router.refresh();
			handleOpenChange(false);
		} catch (error) {
			console.error("Failed to remove player from team:", error);
			setError("Unable to remove this player from the team. Please try again.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={handleOpenChange}
			title={`Remove ${player.firstName}`}
			description="Are you sure you want to remove this player from this team?"
			confirmLabel={`Yes, remove this ${player.firstName} ${player.lastName}`}
			onConfirm={handleDelete}
			error={error}
			isPending={isPending}
		/>
	);
}
