"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateTeam } from "@/features/teams/actions/teams";
import TeamForm from "@/components/forms/teams/TeamForm";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { Team } from "@prisma/client";

type EditTeamDialogProps = {
	team: Team;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function EditTeamDialog({
	team,
	open,
	onOpenChange,
}: EditTeamDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit this team</DialogTitle>
				</DialogHeader>

				{/* only mounted while open, so the form starts from the current team every time */}
				{open && (
					<EditTeamForm team={team} onDone={() => onOpenChange(false)} />
				)}
			</DialogContent>
		</Dialog>
	);
}

function EditTeamForm({ team, onDone }: { team: Team; onDone: () => void }) {
	const router = useRouter();
	const [name, setName] = useState(team.name);
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const trimmedName = name.trim();
	const hasChanges = trimmedName !== team.name;

	async function handleEdit() {
		setError("");
		setIsSaving(true);

		const result = await updateTeam(team.id, {
			name: trimmedName,
			status: team.status,
			imageUrl: team.imageUrl,
		});

		setIsSaving(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success("Team updated");
		router.refresh();
		onDone();
	}

	return (
		<>
			<TeamForm name={name} onNameChange={setName} />

			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}

			<DialogFooter>
				<Button
					type="button"
					onClick={handleEdit}
					disabled={isSaving || !trimmedName || !hasChanges}>
					{isSaving ? "Saving..." : "Save Changes"}
				</Button>
			</DialogFooter>
		</>
	);
}
