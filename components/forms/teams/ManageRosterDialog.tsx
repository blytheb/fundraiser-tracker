"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import PlayerPicker, { type NewPlayer, type PickerPlayer } from "@/components/forms/teams/PlayerPicker";
import { saveTeamRoster } from "@/features/teams/actions/save-team-roster";

type Props = {
	teamId: string;
	teamName: string;
	roster: PickerPlayer[]; // current players (including inactive ones)
	available: PickerPlayer[]; // active players not on the team
};

export default function ManageRosterDialog({ teamId, teamName, roster, available }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button>
						<Users />
						Manage roster
					</Button>
				}
			/>
			<DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Manage roster</DialogTitle>
					<DialogDescription>
						Check players to add them to {teamName}, uncheck to remove them. A team needs at
						least one player.
					</DialogDescription>
				</DialogHeader>

				{/* mounted only while open, so every opening starts from the saved roster */}
				{open && (
					<RosterForm
						teamId={teamId}
						roster={roster}
						available={available}
						onDone={() => setOpen(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function RosterForm({
	teamId,
	roster,
	available,
	onDone,
}: Omit<Props, "teamName"> & { onDone: () => void }) {
	const router = useRouter();
	const rosterIds = new Set(roster.map((p) => p.id));
	const [selected, setSelected] = useState<Set<string>>(() => new Set(rosterIds));
	const [newPlayers, setNewPlayers] = useState<NewPlayer[]>([]);
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	// current roster first, then everyone else, each alphabetical
	const byName = (a: PickerPlayer, b: PickerPlayer) =>
		a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
	const players = [...[...roster].sort(byName), ...[...available].sort(byName)];

	const added = [...selected].filter((id) => !rosterIds.has(id)).length + newPlayers.length;
	const removed = [...rosterIds].filter((id) => !selected.has(id)).length;
	const total = selected.size + newPlayers.length;
	const hasChanges = added > 0 || removed > 0;

	async function handleSave(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (total === 0) return setError("A team needs at least one player.");

		setIsSaving(true);
		const result = await saveTeamRoster(teamId, {
			playerIds: [...selected],
			newPlayers: newPlayers.map(({ firstName, lastName }) => ({ firstName, lastName })),
		});
		setIsSaving(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		const parts = [
			result.data.added > 0 && `${result.data.added} added`,
			result.data.removed > 0 && `${result.data.removed} removed`,
		].filter(Boolean);
		toast.success(`Roster saved${parts.length ? `: ${parts.join(", ")}` : ""}`);
		router.refresh();
		onDone();
	}

	return (
		<form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col gap-4">
			<div className="min-h-0 flex-1 overflow-y-auto pr-1">
				<PlayerPicker
					idPrefix="roster"
					players={players}
					selected={selected}
					onSelectedChange={setSelected}
					newPlayers={newPlayers}
					onNewPlayersChange={setNewPlayers}
					rowHint={(playerId, checked) => {
						const onTeam = rosterIds.has(playerId);
						if (onTeam && !checked)
							return <span className="text-xs font-medium text-destructive">removing</span>;
						if (!onTeam && checked)
							return <span className="text-xs font-medium text-green-700">adding</span>;
						return null;
					}}
				/>
			</div>

			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}

			<DialogFooter className="items-center gap-2 sm:justify-between">
				<span
					className={`text-sm ${total === 0 ? "text-destructive" : "text-muted-foreground"}`}
					aria-live="polite">
					{added > 0 && <span className="text-green-700">+{added} </span>}
					{removed > 0 && <span className="text-destructive">−{removed} </span>}
					{(added > 0 || removed > 0) && "· "}
					{total} {total === 1 ? "player" : "players"}
				</span>
				<Button
					type="submit"
					disabled={isSaving || !hasChanges || total === 0}
					className="w-full sm:w-auto">
					{isSaving ? "Saving..." : "Save roster"}
				</Button>
			</DialogFooter>
		</form>
	);
}
