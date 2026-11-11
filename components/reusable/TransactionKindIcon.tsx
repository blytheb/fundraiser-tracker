import {
	ArrowDownLeft,
	ArrowUpRight,
	CircleDollarSign,
	Receipt,
} from "lucide-react";
import type { TransactionKind } from "@/lib/labels";

// Round icon for the four kinds of transaction; green for income, red for expense.
const ICONS: Record<TransactionKind, typeof ArrowDownLeft> = {
	INDIVIDUAL_INCOME: ArrowDownLeft,
	INDIVIDUAL_EXPENSE: ArrowUpRight,
	TEAM_INCOME: CircleDollarSign,
	TEAM_EXPENSE: Receipt,
};

export default function TransactionKindIcon({
	kind,
	className = "size-10",
}: {
	kind: TransactionKind;
	className?: string;
}) {
	const Icon = ICONS[kind];
	const isIncome = kind === "INDIVIDUAL_INCOME" || kind === "TEAM_INCOME";

	return (
		<div
			className={`flex shrink-0 items-center justify-center rounded-full bg-muted ${className}`}
			aria-hidden="true">
			<Icon
				className={`size-5 ${isIncome ? "text-green-600" : "text-destructive"}`}
			/>
		</div>
	);
}
