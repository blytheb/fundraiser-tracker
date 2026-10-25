"use client";

import { useRouter } from "next/navigation";
import { deleteTeam } from "@/features/teams/actions/teams";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import type { Team } from "@prisma/client";

type DeleteTeamDialogProps = {
	team: Team;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function DeleteTeamDialog({
	team,
	open,
	onOpenChange,
}: DeleteTeamDialogProps) {
	const router = useRouter();

	async function handleDelete() {
		try {
			await deleteTeam(team.id);
			router.refresh();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete team:", error);
		}
	}

	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={onOpenChange}
			title={`Delete ${team.name}`}
			description="Are you sure you want to delete this team?"
			confirmLabel="Yes, delete this team"
			onConfirm={handleDelete}
		/>
	);
}
