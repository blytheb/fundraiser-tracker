"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftRight } from "lucide-react";
import type { Pot } from "@prisma/client";

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
import PotSelect from "@/components/forms/transactions/PotSelect";
import { createPotTransfer } from "@/features/transactions/actions/pot-transfers";
import { todayInputValue } from "@/features/transactions/lib/dates";
import { formatCurrency } from "@/lib/format";
import { POT_LABELS } from "@/lib/labels";

type PotBalance = { pot: Pot; balance: number };

// "Move money" on the admin player page: from one of the player's pots to another,
// e.g. General fundraiser money into Travel.
export default function MovePotMoneyButton({
	playerId,
	pots,
}: {
	playerId: string;
	pots: PotBalance[];
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button variant="outline" size="sm" onClick={() => setOpen(true)}>
				<ArrowLeftRight />
				Move money
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Move money between pots</DialogTitle>
						<DialogDescription>
							The player&apos;s total stays the same; only the pots change.
						</DialogDescription>
					</DialogHeader>
					{open && (
						<MoveForm playerId={playerId} pots={pots} onDone={() => setOpen(false)} />
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

function MoveForm({
	playerId,
	pots,
	onDone,
}: {
	playerId: string;
	pots: PotBalance[];
	onDone: () => void;
}) {
	const router = useRouter();
	// default: from the pot with the most money (usually General) into Travel
	const richest = [...pots].sort((a, b) => b.balance - a.balance)[0]?.pot ?? "GENERAL";
	const [fromPot, setFromPot] = useState<Pot>(richest);
	const [toPot, setToPot] = useState<Pot>(richest === "TRAVEL" ? "GENERAL" : "TRAVEL");
	const [amount, setAmount] = useState("");
	const [date, setDate] = useState(todayInputValue);
	const [note, setNote] = useState("");
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const available = Math.max(0, pots.find((p) => p.pot === fromPot)?.balance ?? 0);

	function changeFrom(next: Pot) {
		setFromPot(next);
		if (next === toPot) setToPot(pots.find((p) => p.pot !== next)?.pot ?? "GENERAL");
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setIsSaving(true);
		const result = await createPotTransfer({
			playerId,
			fromPot,
			toPot,
			amount: Number(amount),
			date,
			note,
		});
		setIsSaving(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		toast.success(`Moved ${formatCurrency(Number(amount))} to ${POT_LABELS[toPot]}`);
		router.refresh();
		onDone();
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<Label htmlFor="move-from">From</Label>
					<PotSelect id="move-from" value={fromPot} onChange={changeFrom} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="move-to">To</Label>
					<PotSelect id="move-to" value={toPot} onChange={setToPot} exclude={fromPot} />
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<Label htmlFor="move-amount">Amount</Label>
					<Input
						id="move-amount"
						type="number"
						inputMode="decimal"
						min="0.01"
						step="0.01"
						placeholder="0.00"
						value={amount}
						onChange={(event) => setAmount(event.target.value)}
						required
					/>
					<button
						type="button"
						className="text-xs text-muted-foreground underline underline-offset-2"
						onClick={() => setAmount(available.toFixed(2))}>
						{formatCurrency(available)} available in {POT_LABELS[fromPot]}
					</button>
				</div>
				<div className="space-y-2">
					<Label htmlFor="move-date">Date</Label>
					<Input
						id="move-date"
						type="date"
						value={date}
						onChange={(event) => setDate(event.target.value)}
						required
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="move-note">Note (optional)</Label>
				<Input
					id="move-note"
					placeholder="e.g. Toward travel deposit"
					value={note}
					onChange={(event) => setNote(event.target.value)}
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
					{isSaving ? "Moving..." : "Move money"}
				</Button>
			</DialogFooter>
		</form>
	);
}
