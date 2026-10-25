"use client";

import { useRouter } from "next/navigation";
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
	const router = useRouter();

	async function handleDelete() {
		try {
			await deletePlayer(player.id);
			router.refresh();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete player:", error);
		}
	}

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={onOpenChange}
			title={`Delete ${player.firstName} ${player.lastName}`}
			description="Are you sure you want to delete this player?"
			confirmLabel="Yes, delete this player"
			onConfirm={handleDelete}
		/>
	);
}
