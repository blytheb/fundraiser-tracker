"use client";

import {
	Dialog,
	DialogDescription,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { removePlayerFromTeam } from "@/features/teams/actions/teamPlayers";

import type { Player } from "@/prisma/client";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Remove {player.firstName}</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to remove this player?
				</DialogDescription>

				<DialogFooter>
					<Button onClick={handleDelete}>Yes, remove this player</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
