"use client";

import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import { useRouter } from "next/navigation";
import { removePlayerFromTeam } from "@/features/teams/actions/teamPlayers";

import type { Player } from "@prisma/client";

type DeleteTeamDialogProps = {
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
}: DeleteTeamDialogProps) {
	const router = useRouter();

	async function handleDelete() {
		try {
			await removePlayerFromTeam(teamId, player.id);
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
			title={`Remove ${player.firstName}`}
			description="Are you sure you want to remove this player from this team?"
			confirmLabel={`Yes, remove this ${player.firstName} ${player.lastName}`}
			onConfirm={handleDelete}
		/>
	);
}
