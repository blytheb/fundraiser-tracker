import {
	ArrowDownLeft,
	ArrowLeftRight,
	ArrowUpRight,
	CircleDollarSign,
	Receipt,
} from "lucide-react";
import type { TransactionKind } from "@/lib/labels";

type IconKind = TransactionKind | "TRANSFER";

// Round icon for each kind of transaction; green for income, red for expense,
// grey for a move between a player's pots.
const ICONS: Record<IconKind, typeof ArrowDownLeft> = {
	INDIVIDUAL_INCOME: ArrowDownLeft,
	INDIVIDUAL_EXPENSE: ArrowUpRight,
	TEAM_INCOME: CircleDollarSign,
	TEAM_EXPENSE: Receipt,
	TRANSFER: ArrowLeftRight,
};

export default function TransactionKindIcon({
	kind,
	className = "size-10",
}: {
	kind: IconKind;
	className?: string;
}) {
	const Icon = ICONS[kind];
	const color =
		kind === "TRANSFER"
			? "text-muted-foreground"
			: kind === "INDIVIDUAL_INCOME" || kind === "TEAM_INCOME"
				? "text-green-600"
				: "text-destructive";

	return (
		<div
			className={`flex shrink-0 items-center justify-center rounded-full bg-muted ${className}`}
			aria-hidden="true">
			<Icon
				className={`size-5 ${color}`}
			/>
		</div>
	);
}
