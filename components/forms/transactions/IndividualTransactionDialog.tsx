"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TransactionDirection } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import DirectionToggle from "@/components/forms/transactions/DirectionToggle";
import { createIndividualTransaction } from "@/features/transactions/actions/create-individual-transaction";
import { todayInputValue } from "@/features/transactions/lib/dates";

type PlayerOption = { id: string; name: string };

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialDirection: TransactionDirection;
	players: PlayerOption[];
};

export default function IndividualTransactionDialog({
	open,
	onOpenChange,
	initialDirection,
	players,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New individual transaction</DialogTitle>
					<DialogDescription>
						Money in or out for one player. It&apos;s posted to their balance right away.
					</DialogDescription>
				</DialogHeader>

				{/* mounted only while open, so every opening starts with a fresh form */}
				{open && (
					<IndividualTransactionForm
						initialDirection={initialDirection}
						players={players}
						onDone={() => onOpenChange(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function IndividualTransactionForm({
	initialDirection,
	players,
	onDone,
}: {
	initialDirection: TransactionDirection;
	players: PlayerOption[];
	onDone: () => void;
}) {
	const router = useRouter();
	const [direction, setDirection] = useState(initialDirection);
	const [playerId, setPlayerId] = useState("");
	const [amount, setAmount] = useState("");
	const [date, setDate] = useState(todayInputValue);
	const [description, setDescription] = useState("");
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const playerItems = Object.fromEntries(players.map((p) => [p.id, p.name]));

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (!playerId) {
			setError("Choose a player.");
			return;
		}

		setIsSaving(true);
		const result = await createIndividualTransaction({
			playerId,
			direction,
			amount: Number(amount),
			date,
			description,
		});
		setIsSaving(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success(
			direction === "INCOME" ? "Income recorded" : "Expense recorded",
		);
		router.refresh();
		onDone();
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<DirectionToggle value={direction} onChange={setDirection} />

			<div className="space-y-2">
				<Label htmlFor="individual-player">Player</Label>
				<Select
					items={playerItems}
					value={playerId || null}
					onValueChange={(value) => setPlayerId((value as string | null) ?? "")}>
					<SelectTrigger id="individual-player" className="w-full">
						<SelectValue placeholder="Choose a player" />
					</SelectTrigger>
					<SelectContent>
						{players.map((player) => (
							<SelectItem key={player.id} value={player.id}>
								{player.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<Label htmlFor="individual-amount">Amount</Label>
					<Input
						id="individual-amount"
						type="number"
						inputMode="decimal"
						min="0.01"
						step="0.01"
						placeholder="0.00"
						value={amount}
						onChange={(event) => setAmount(event.target.value)}
						required
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="individual-date">Date</Label>
					<Input
						id="individual-date"
						type="date"
						value={date}
						onChange={(event) => setDate(event.target.value)}
						required
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="individual-description">Note (optional)</Label>
				<Input
					id="individual-description"
					placeholder={direction === "INCOME" ? "e.g. Parent deposit" : "e.g. Uniform"}
					value={description}
					onChange={(event) => setDescription(event.target.value)}
					maxLength={200}
				/>
			</div>

			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}

			<DialogFooter>
				<Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
					{isSaving
						? "Saving..."
						: direction === "INCOME"
							? "Record income"
							: "Record expense"}
				</Button>
			</DialogFooter>
		</form>
	);
}
