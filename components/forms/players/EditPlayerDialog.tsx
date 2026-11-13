"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePlayer } from "@/features/players/actions/players";

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

import type { Player } from "@prisma/client";
import PlayerForm from "@/components/forms/players/PlayerForm";

type EditPlayerDialogProps = {
	player: Player;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function EditPlayerDialog({
	player,
	open,
	onOpenChange,
}: EditPlayerDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit this Player</DialogTitle>
				</DialogHeader>

				{/* only mounted while open, so the form starts from the current player every time */}
				{open && (
					<EditPlayerForm player={player} onDone={() => onOpenChange(false)} />
				)}
			</DialogContent>
		</Dialog>
	);
}

function EditPlayerForm({
	player,
	onDone,
}: {
	player: Player;
	onDone: () => void;
}) {
	const router = useRouter();
	const [firstName, setFirstName] = useState(player.firstName);
	const [lastName, setLastName] = useState(player.lastName);
	const [active, setActive] = useState(player.status);
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const trimmedFirst = firstName.trim();
	const trimmedLast = lastName.trim();
	const hasChanges =
		trimmedFirst !== player.firstName ||
		trimmedLast !== player.lastName ||
		active !== player.status;

	async function handleEdit() {
		setError("");
		setIsSaving(true);

		const result = await updatePlayer(player.id, {
			firstName: trimmedFirst,
			lastName: trimmedLast,
			status: active,
			// undefined (not "") so a player without a photo keeps imageUrl = null
			imageUrl: player.imageUrl ?? undefined,
		});

		setIsSaving(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success("Player updated");
		router.refresh();
		onDone();
	}

	return (
		<>
			<PlayerForm
				firstName={firstName}
				lastName={lastName}
				onFirstNameChange={setFirstName}
				onLastNameChange={setLastName}
			/>

			<div className="flex items-start justify-between gap-4 rounded-lg border p-3">
				<div>
					<Label htmlFor="player-active">Active player</Label>
					<p className="mt-1 text-xs text-muted-foreground">
						Inactive players keep their history but are hidden from new transactions.
					</p>
				</div>
				<Switch id="player-active" checked={active} onCheckedChange={setActive} />
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
					disabled={isSaving || !trimmedFirst || !trimmedLast || !hasChanges}>
					{isSaving ? "Saving..." : "Save Changes"}
				</Button>
			</DialogFooter>
		</>
	);
}
