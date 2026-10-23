"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	addPlayerExpense,
	addPlayerPayment,
} from "@/features/players/actions/playerTransactions";

type PlayerTransactionFormProps = {
	playerId: string;
};

export default function PlayerTransactionForm({
	playerId,
}: PlayerTransactionFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const [type, setType] = useState<"PAYMENT" | "EXPENSE">("PAYMENT");
	const [amount, setAmount] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
	const [error, setError] = useState("");

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		const numericAmount = Number(amount);

		if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
			setError("Enter an amount greater than $0.");
			return;
		}

		if (!date) {
			setError("Select a transaction date.");
			return;
		}

		startTransition(async () => {
			try {
				const data = {
					playerId,
					amount: Math.round(numericAmount * 100) / 100,
					description: description.trim() || undefined,
					date,
				};

				if (type === "PAYMENT") {
					await addPlayerPayment(data);
				} else {
					await addPlayerExpense(data);
				}

				setAmount("");
				setDescription("");
				setError("");
				router.refresh();
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Unable to save the transaction. Please try again.",
				);
			}
		});
	}

	return (
		<section className="rounded-xl border bg-card p-5 sm:p-6">
			<h2 className="text-lg font-semibold">Add Player Transaction</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Record an individual deposit or expense for this player.
			</p>

			<form onSubmit={handleSubmit} className="mt-5 space-y-4">
				<div className="space-y-2">
					<label htmlFor="transaction-type" className="text-sm font-medium">
						Transaction Type
					</label>
					<select
						id="transaction-type"
						value={type}
						onChange={(event) =>
							setType(event.target.value as "PAYMENT" | "EXPENSE")
						}
						disabled={isPending}
						className="w-full rounded-md border bg-background px-3 py-2 text-sm">
						<option value="PAYMENT">Deposit</option>
						<option value="EXPENSE">Expense</option>
					</select>
				</div>

				<div className="space-y-2">
					<label htmlFor="transaction-amount" className="text-sm font-medium">
						Amount ($)
					</label>
					<input
						id="transaction-amount"
						type="number"
						min="0.01"
						step="0.01"
						inputMode="decimal"
						required
						value={amount}
						onChange={(event) => setAmount(event.target.value)}
						disabled={isPending}
						placeholder="0.00"
						className="w-full rounded-md border bg-background px-3 py-2 text-sm"
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="transaction-date" className="text-sm font-medium">
						Date
					</label>
					<input
						id="transaction-date"
						type="date"
						required
						value={date}
						onChange={(event) => setDate(event.target.value)}
						disabled={isPending}
						className="w-full rounded-md border bg-background px-3 py-2 text-sm"
					/>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="transaction-description"
						className="text-sm font-medium">
						Description (optional)
					</label>
					<input
						id="transaction-description"
						type="text"
						maxLength={500}
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						disabled={isPending}
						placeholder={
							type === "PAYMENT"
								? "e.g. Uniform reimbursement"
								: "e.g. Tournament expense"
						}
						className="w-full rounded-md border bg-background px-3 py-2 text-sm"
					/>
				</div>

				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}

				<button
					type="submit"
					disabled={isPending}
					className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
					{isPending ? "Saving..." : "Save Transaction"}
				</button>
			</form>
		</section>
	);
}
