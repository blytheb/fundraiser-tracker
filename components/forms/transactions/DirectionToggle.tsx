"use client";

import type { TransactionDirection } from "@prisma/client";

// Segmented Income / Expense control. Radio buttons underneath, so it works
// with the keyboard and screen readers.
export default function DirectionToggle({
	value,
	onChange,
	name = "direction",
}: {
	value: TransactionDirection;
	onChange: (value: TransactionDirection) => void;
	name?: string;
}) {
	const options: { value: TransactionDirection; label: string; active: string }[] = [
		{ value: "INCOME", label: "Income", active: "bg-green-600 text-white" },
		{ value: "EXPENSE", label: "Expense", active: "bg-destructive text-white" },
	];

	return (
		<div
			role="radiogroup"
			aria-label="Income or expense"
			className="grid grid-cols-2 gap-1 rounded-lg border bg-muted p-1">
			{options.map((option) => {
				const checked = value === option.value;
				return (
					<label
						key={option.value}
						className={`flex h-9 cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring ${
							checked ? option.active : "text-muted-foreground hover:bg-background"
						}`}>
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={checked}
							onChange={() => onChange(option.value)}
							className="sr-only"
						/>
						{option.label}
					</label>
				);
			})}
		</div>
	);
}
