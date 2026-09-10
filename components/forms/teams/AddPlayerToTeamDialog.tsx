"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
	addPlayerToTeam,
	createPlayerAndAddToTeam,
} from "@/features/teams/actions/teamPlayers";

import type { Player } from "@prisma/client";

type AddPlayerToTeamDialogProps = {
	teamId: string;
	availablePlayers: Player[];
};

export default function AddPlayerToTeamDialog({
	teamId,
	availablePlayers,
}: AddPlayerToTeamDialogProps) {
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [mode, setMode] = useState<"existing" | "create">("existing");

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

	const filteredPlayers = availablePlayers.filter((player) => {
		const searchText = `${player.firstName} ${player.lastName}`.toLowerCase();

		return searchText.includes(search.toLowerCase());
	});

	async function handleAddPlayer(playerId: string) {
		try {
			await addPlayerToTeam(teamId, playerId);

			router.refresh();
			setSearch("");
			setOpen(false);
		} catch (error) {
			console.error("Failed to add player:", error);
		}
	}

	async function handleCreatePlayer() {
		try {
			await createPlayerAndAddToTeam(teamId, {
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				status: true,
			});

			router.refresh();

			setFirstName("");
			setLastName("");
			setMode("existing");
			setOpen(false);
		} catch (error) {
			console.error("Failed to create player:", error);
		}
	}

	function handleOpenChange(value: boolean) {
		setOpen(value);

		if (!value) {
			setSearch("");
			setFirstName("");
			setLastName("");
			setMode("existing");
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger render={<Button>Add Player</Button>}></DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Player to Roster</DialogTitle>
				</DialogHeader>

				{mode === "existing" ? (
					<div className="space-y-4">
						<Input
							placeholder="Search players..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>

						<div className="max-h-64 overflow-y-auto rounded-md border">
							{search.length === 0 ? (
								<div className="p-4 text-sm text-muted-foreground">
									Search for an existing player
								</div>
							) : filteredPlayers.length === 0 ? (
								<div className="p-4 text-sm text-muted-foreground">
									No players found
								</div>
							) : (
								filteredPlayers.map((player) => (
									<div
										key={player.id}
										className="flex items-center justify-between border-b p-3 last:border-b-0">
										<span>
											{player.firstName} {player.lastName}
										</span>

										<Button
											size="sm"
											onClick={() => handleAddPlayer(player.id)}>
											Add
										</Button>
									</div>
								))
							)}
						</div>

						<div className="border-t pt-4">
							<Button
								variant="outline"
								className="w-full"
								onClick={() => setMode("create")}>
								+ Create New Player
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<Input
							placeholder="First name"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						/>

						<Input
							placeholder="Last name"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						/>

						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setMode("existing")}>
								Back
							</Button>

							<Button
								className="flex-1"
								onClick={handleCreatePlayer}
								disabled={!firstName.trim() || !lastName.trim()}>
								Create & Add
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
