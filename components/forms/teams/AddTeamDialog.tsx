"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTeam } from "@/features/teams/actions/teams";
import PlayerPicker, { type NewPlayer, type PickerPlayer } from "@/components/forms/teams/PlayerPicker";

type PlayerOption = PickerPlayer;

type Props = {
	players: PlayerOption[]; // active players to choose from
};

export default function AddTeamDialog({ players }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button className="w-full sm:w-auto">
						<Plus />
						Create New Team
					</Button>
				}
			/>
			<DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create a new team</DialogTitle>
					<DialogDescription>
						Name the team and add its players. A team needs at least one player.
					</DialogDescription>
				</DialogHeader>

				{/* mounted only while open, so every opening starts empty */}
				{open && <NewTeamForm players={players} onDone={() => setOpen(false)} />}
			</DialogContent>
		</Dialog>
	);
}

function NewTeamForm({ players, onDone }: { players: PlayerOption[]; onDone: () => void }) {
	const router = useRouter();
	const [name, setName] = useState("");
	const [selected, setSelected] = useState<Set<string>>(() => new Set());
	const [newPlayers, setNewPlayers] = useState<NewPlayer[]>([]);
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const playerCount = selected.size + newPlayers.length;
	const canSave = name.trim().length > 0 && playerCount > 0 && !isSaving;

	async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (!name.trim()) return setError("Enter a team name.");
		if (playerCount === 0) return setError("Add at least one player to the team.");

		setIsSaving(true);
		const result = await createTeam({
			name,
			status: "IN_SEASON",
			playerIds: [...selected],
			newPlayers: newPlayers.map(({ firstName, lastName }) => ({ firstName, lastName })),
		});
		setIsSaving(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success(`Team created with ${playerCount} ${playerCount === 1 ? "player" : "players"}`);
		router.refresh();
		onDone();
	}

	return (
		<form onSubmit={handleCreate} className="flex min-h-0 flex-1 flex-col gap-4">
			<div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
				<div className="space-y-2">
					<Label htmlFor="new-team-name">Team name</Label>
					<Input
						id="new-team-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						maxLength={80}
						required
					/>
				</div>

				<PlayerPicker
					idPrefix="new-team"
					players={players}
					selected={selected}
					onSelectedChange={setSelected}
					newPlayers={newPlayers}
					onNewPlayersChange={setNewPlayers}
				/>
			</div>

			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}

			<DialogFooter className="items-center gap-2 sm:justify-between">
				<span className="text-sm text-muted-foreground">
					{playerCount} {playerCount === 1 ? "player" : "players"} on this team
				</span>
				<Button type="submit" disabled={!canSave} className="w-full sm:w-auto">
					{isSaving ? "Creating..." : "Create team"}
				</Button>
			</DialogFooter>
		</form>
	);
}
