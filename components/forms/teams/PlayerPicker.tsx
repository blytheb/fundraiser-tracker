"use client";

import { useState } from "react";
import { Search, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nameKey } from "@/features/players/lib/player-names";

export type PickerPlayer = {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	status?: boolean; // false = inactive (still shown if already on the roster)
};

export type NewPlayer = { key: string; firstName: string; lastName: string };

type Props = {
	idPrefix: string;
	players: PickerPlayer[];
	selected: Set<string>;
	onSelectedChange: (next: Set<string>) => void;
	newPlayers: NewPlayer[];
	onNewPlayersChange: (next: NewPlayer[]) => void;
	// optional per-row marker, e.g. "added" / "removed" in the roster dialog
	rowHint?: (playerId: string, checked: boolean) => React.ReactNode;
};

// Searchable checklist of existing players + inline "add a new player" fields.
// Typing a name that already exists selects that player instead of creating a duplicate.
export default function PlayerPicker({
	idPrefix,
	players,
	selected,
	onSelectedChange,
	newPlayers,
	onNewPlayersChange,
	rowHint,
}: Props) {
	const [search, setSearch] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [notice, setNotice] = useState("");

	const byKey = new Map(players.map((p) => [nameKey(p.firstName, p.lastName), p]));
	const query = search.trim().toLowerCase();
	const filtered = players.filter((p) => p.name.toLowerCase().includes(query));

	function toggle(playerId: string, checked: boolean) {
		const next = new Set(selected);
		if (checked) next.add(playerId);
		else next.delete(playerId);
		onSelectedChange(next);
	}

	function addNewPlayer() {
		setNotice("");
		if (!firstName.trim() || !lastName.trim()) {
			setNotice("Enter a first and last name.");
			return;
		}

		const key = nameKey(firstName, lastName);
		const existing = byKey.get(key);
		if (existing) {
			onSelectedChange(new Set(selected).add(existing.id));
			setNotice(`${existing.name} already exists, so they were selected from the list instead.`);
			setFirstName("");
			setLastName("");
			return;
		}
		if (newPlayers.some((p) => p.key === key)) {
			setNotice("You already added this player.");
			return;
		}

		onNewPlayersChange([
			...newPlayers,
			{ key, firstName: firstName.trim(), lastName: lastName.trim() },
		]);
		setFirstName("");
		setLastName("");
	}

	const onEnter = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") {
			event.preventDefault();
			addNewPlayer();
		}
	};

	return (
		<div className="space-y-5">
			<section className="space-y-2">
				<div className="flex items-baseline justify-between">
					<Label htmlFor={`${idPrefix}-search`}>Players</Label>
					<span className="text-xs text-muted-foreground">{selected.size} selected</span>
				</div>
				<div className="relative">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id={`${idPrefix}-search`}
						placeholder="Search players..."
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						className="pl-9"
					/>
				</div>
				<ul className="max-h-56 divide-y overflow-y-auto rounded-lg border">
					{filtered.length === 0 ? (
						<li className="px-3 py-4 text-center text-sm text-muted-foreground">
							{players.length === 0 ? "No players yet. Add new ones below." : "No matches."}
						</li>
					) : (
						filtered.map((player) => {
							const id = `${idPrefix}-player-${player.id}`;
							const checked = selected.has(player.id);
							return (
								<li key={player.id} className="flex items-center gap-3 px-3 py-2">
									<Checkbox
										id={id}
										checked={checked}
										onCheckedChange={(value) => toggle(player.id, value)}
									/>
									<label htmlFor={id} className="flex-1 cursor-pointer text-sm">
										{player.name}
										{player.status === false && (
											<span className="ml-1.5 text-xs text-muted-foreground">(inactive)</span>
										)}
									</label>
									{rowHint?.(player.id, checked)}
								</li>
							);
						})
					)}
				</ul>
			</section>

			<section className="space-y-2">
				<Label>New players</Label>
				<div className="grid grid-cols-[1fr_1fr_auto] gap-2">
					<Input
						placeholder="First name"
						aria-label="New player first name"
						value={firstName}
						onChange={(event) => setFirstName(event.target.value)}
						onKeyDown={onEnter}
					/>
					<Input
						placeholder="Last name"
						aria-label="New player last name"
						value={lastName}
						onChange={(event) => setLastName(event.target.value)}
						onKeyDown={onEnter}
					/>
					<Button type="button" variant="outline" onClick={addNewPlayer} aria-label="Add new player">
						<UserPlus />
						<span className="hidden sm:inline">Add</span>
					</Button>
				</div>
				{notice && (
					<p className="text-sm text-amber-700 dark:text-amber-400" role="status">
						{notice}
					</p>
				)}
				{newPlayers.length > 0 && (
					<ul className="flex flex-wrap gap-2">
						{newPlayers.map((p) => (
							<li
								key={p.key}
								className="inline-flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-sm">
								{p.firstName} {p.lastName}
								<span className="text-xs text-green-700">new</span>
								<button
									type="button"
									onClick={() => onNewPlayersChange(newPlayers.filter((x) => x.key !== p.key))}
									className="rounded-full p-0.5 hover:bg-background"
									aria-label={`Remove ${p.firstName} ${p.lastName}`}>
									<X className="size-3.5" />
								</button>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
