"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	addPlayerExpense,
	addPlayerPayment,
} from "@/features/players/actions/playerTransactions";
import PlayerTransactionFields from "@/components/forms/players/PlayerTransactionFields";

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
	const [date, setDate] = useState(
		new Date().toLocaleDateString("en-CA", {
			timeZone: "Pacific/Honolulu",
		}),
	);
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
				<PlayerTransactionFields
					type={type}
					amount={amount}
					date={date}
					description={description}
					isPending={isPending}
					onTypeChange={setType}
					onAmountChange={setAmount}
					onDateChange={setDate}
					onDescriptionChange={setDescription}
				/>

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
