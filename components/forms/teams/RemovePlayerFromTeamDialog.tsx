"use client";

import { useState } from "react";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

		const result = await removePlayerFromTeam(teamId, player.id);
		setIsPending(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success("Player removed from team");
		router.refresh();
		handleOpenChange(false);
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
