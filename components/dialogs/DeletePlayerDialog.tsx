"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePlayer } from "@/features/players/actions/players";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import type { Player } from "@prisma/client";

type DeletePlayerDialogProps = {
	player: Player;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function DeletePlayerDialog({
	player,
	open,
	onOpenChange,
}: DeletePlayerDialogProps) {
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	async function handleDelete() {
		setError("");
		setIsPending(true);

		const result = await deletePlayer(player.id);
		setIsPending(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success("Player deleted");
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
			title={`Delete ${player.firstName} ${player.lastName}`}
			description="Are you sure you want to delete this player?"
			confirmLabel="Yes, delete this player"
			onConfirm={handleDelete}
			error={error}
			isPending={isPending}
		/>
	);
}
