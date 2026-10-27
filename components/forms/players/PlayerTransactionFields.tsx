"use client";

type PlayerTransactionFieldsProps = {
	type: "PAYMENT" | "EXPENSE";
	amount: string;
	date: string;
	description: string;
	isPending: boolean;
	onTypeChange: (value: "PAYMENT" | "EXPENSE") => void;
	onAmountChange: (value: string) => void;
	onDateChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
};

export default function PlayerTransactionFields({
	type,
	amount,
	date,
	description,
	isPending,
	onTypeChange,
	onAmountChange,
	onDateChange,
	onDescriptionChange,
}: PlayerTransactionFieldsProps) {
	return (
		<>
			<div className="space-y-2">
				<label htmlFor="transaction-type" className="text-sm font-medium">
					Transaction Type
				</label>
				<select
					id="transaction-type"
					value={type}
					onChange={(event) =>
						onTypeChange(event.target.value as "PAYMENT" | "EXPENSE")
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
					onChange={(event) => onAmountChange(event.target.value)}
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
					onChange={(event) => onDateChange(event.target.value)}
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
					onChange={(event) => onDescriptionChange(event.target.value)}
					disabled={isPending}
					placeholder={
						type === "PAYMENT"
							? "e.g. Uniform reimbursement"
							: "e.g. Tournament expense"
					}
					className="w-full rounded-md border bg-background px-3 py-2 text-sm"
				/>
			</div>
		</>
	);
}
