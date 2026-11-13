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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
	const [inSeason, setInSeason] = useState(team.status === "IN_SEASON");
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const trimmedName = name.trim();
	const status = inSeason ? "IN_SEASON" : "SEASON_ENDED";
	const hasChanges = trimmedName !== team.name || status !== team.status;

	async function handleEdit() {
		setError("");
		setIsSaving(true);

		const result = await updateTeam(team.id, {
			name: trimmedName,
			status,
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

			<div className="flex items-start justify-between gap-4 rounded-lg border p-3">
				<div>
					<Label htmlFor="team-in-season">In season</Label>
					<p className="mt-1 text-xs text-muted-foreground">
						Teams whose season ended keep their history but aren&apos;t offered for new
						team transactions.
					</p>
				</div>
				<Switch id="team-in-season" checked={inSeason} onCheckedChange={setInSeason} />
			</div>

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
