"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState("");
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

		const result = await deleteTeam(team.id);
		setIsPending(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success("Team deleted");
		handleOpenChange(false);
		router.push("/admin/teams");
		router.refresh();
	}
	return (
		<ConfirmDeleteDialog
			open={open}
			onOpenChange={handleOpenChange}
			title={`Delete ${team.name}`}
			description="Are you sure you want to delete this team?"
			confirmLabel="Yes, delete this team"
			onConfirm={handleDelete}
			error={error}
			isPending={isPending}
		/>
	);
}
