"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Pot, TransactionDirection } from "@prisma/client";

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
import PotSelect from "@/components/forms/transactions/PotSelect";
import { createIndividualTransaction } from "@/features/transactions/actions/create-individual-transaction";
import {
	deleteIndividualTransaction,
	updateIndividualTransaction,
} from "@/features/transactions/actions/individual-transactions";
import { todayInputValue } from "@/features/transactions/lib/dates";
import type { IndividualEditData } from "@/features/transactions/data/get-transaction-feed";

type PlayerOption = { id: string; name: string };

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	players: PlayerOption[];
	initialDirection?: TransactionDirection; // new transaction
	initialPlayerId?: string; // new transaction for a specific player (player page)
	transaction?: IndividualEditData; // editing an existing one
};

export default function IndividualTransactionDialog({
	open,
	onOpenChange,
	players,
	initialDirection = "INCOME",
	initialPlayerId,
	transaction,
}: Props) {
	const isEdit = Boolean(transaction);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit individual transaction" : "New individual transaction"}
					</DialogTitle>
					<DialogDescription>
						Money in or out for one player. Parents see it on the player&apos;s page right away.
					</DialogDescription>
				</DialogHeader>

				{/* mounted only while open, so every opening starts from the saved values */}
				{open && (
					<IndividualTransactionForm
						key={transaction?.id ?? "new"}
						initialDirection={transaction?.direction ?? initialDirection}
						initialPlayerId={initialPlayerId}
						transaction={transaction}
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
	initialPlayerId,
	transaction,
	players,
	onDone,
}: {
	initialDirection: TransactionDirection;
	initialPlayerId?: string;
	transaction?: IndividualEditData;
	players: PlayerOption[];
	onDone: () => void;
}) {
	const router = useRouter();
	const [direction, setDirection] = useState(initialDirection);
	const [playerId, setPlayerId] = useState(transaction?.playerId ?? initialPlayerId ?? "");
	const [pot, setPot] = useState<Pot>(transaction?.pot ?? "GENERAL");
	const [amount, setAmount] = useState(transaction ? transaction.amount.toFixed(2) : "");
	const [date, setDate] = useState(transaction?.date ?? todayInputValue());
	const [description, setDescription] = useState(transaction?.description ?? "");
	const [error, setError] = useState("");
	const [busy, setBusy] = useState<"save" | "delete" | null>(null);
	const [confirmingDelete, setConfirmingDelete] = useState(false);

	// an inactive player on an existing transaction still needs to appear in the list
	const currentPlayerId = transaction?.playerId ?? initialPlayerId;
	const options =
		currentPlayerId && !players.some((p) => p.id === currentPlayerId)
			? [...players, { id: currentPlayerId, name: "Inactive player" }]
			: players;
	const playerItems = Object.fromEntries(options.map((p) => [p.id, p.name]));

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (!playerId) {
			setError("Choose a player.");
			return;
		}

		const input = { playerId, direction, pot, amount: Number(amount), date, description };

		setBusy("save");
		const result = transaction
			? await updateIndividualTransaction(transaction.id, input)
			: await createIndividualTransaction(input);
		setBusy(null);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success(
			transaction
				? "Transaction updated"
				: direction === "INCOME"
					? "Income recorded"
					: "Expense recorded",
		);
		router.refresh();
		onDone();
	}

	async function handleDelete() {
		if (!transaction) return;
		setError("");
		setBusy("delete");
		const result = await deleteIndividualTransaction(transaction.id);
		setBusy(null);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success("Transaction deleted");
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
						{options.map((player) => (
							<SelectItem key={player.id} value={player.id}>
								{player.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="individual-pot">
					{direction === "INCOME" ? "Into pot" : "From pot"}
				</Label>
				<PotSelect id="individual-pot" value={pot} onChange={setPot} />
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

			{confirmingDelete ? (
				<div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
					<p className="text-sm">
						Delete this transaction? It&apos;s removed from the list and the player&apos;s
						balance. A record is kept for history.
					</p>
					<div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => setConfirmingDelete(false)}
							disabled={busy !== null}>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDelete}
							disabled={busy !== null}>
							{busy === "delete" ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</div>
			) : (
				<DialogFooter className="gap-2 sm:justify-between">
					{transaction ? (
						<Button
							type="button"
							variant="ghost"
							className="text-destructive"
							onClick={() => setConfirmingDelete(true)}
							disabled={busy !== null}>
							Delete
						</Button>
					) : (
						<span className="hidden sm:block" />
					)}
					<Button type="submit" disabled={busy !== null} className="w-full sm:w-auto">
						{busy === "save"
							? "Saving..."
							: transaction
								? "Save changes"
								: direction === "INCOME"
									? "Record income"
									: "Record expense"}
					</Button>
				</DialogFooter>
			)}
		</form>
	);
}
