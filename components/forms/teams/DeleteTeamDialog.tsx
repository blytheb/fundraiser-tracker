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
import { deleteTeam } from "@/features/teams/actions/teams";

import type { Team } from "@/types/team";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete {team.name}</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to delete this team?
				</DialogDescription>

				<DialogFooter>
					<Button onClick={handleDelete}>Yes, delete this team</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
