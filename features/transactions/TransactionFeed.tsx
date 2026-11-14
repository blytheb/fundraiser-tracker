import Link from "next/link";
import { ChevronRight, ReceiptText } from "lucide-react";

import StatusBadge from "@/components/reusable/StatusBadge";
import TransactionKindIcon from "@/components/reusable/TransactionKindIcon";
import { formatCurrency, formatDate } from "@/lib/format";
import { POT_LABELS, TRANSACTION_KIND_LABELS } from "@/lib/labels";
import type { FeedRow } from "@/features/transactions/data/get-transaction-feed";
import {
	IndividualEditProvider,
	IndividualRowButton,
} from "@/features/transactions/IndividualEditContext";

// columns on desktop: transaction | kind | date | status | amount | chevron
const GRID =
	"md:grid md:grid-cols-[minmax(0,1fr)_150px_110px_120px_120px_16px] md:items-center md:gap-4";

function Amount({ amount, muted }: { amount: number; muted: boolean }) {
	const color = muted
		? "text-muted-foreground"
		: amount > 0
			? "text-green-700"
			: amount < 0
				? "text-destructive"
				: "";
	return (
		<span className={`font-semibold tabular-nums ${color}`}>
			{amount > 0 ? "+" : ""}
			{formatCurrency(amount)}
		</span>
	);
}

type PlayerOption = { id: string; name: string };

type Props = {
	rows: FeedRow[];
	players?: PlayerOption[]; // enables the individual transaction edit dialog
	// always use the stacked card layout (for narrow columns, e.g. the team page)
	compact?: boolean;
	emptyMessage?: string;
};

export default function TransactionFeed({
	rows,
	players = [],
	compact = false,
	emptyMessage = "Try a different filter, or add a new transaction.",
}: Props) {
	if (rows.length === 0) {
		return (
			<div className="rounded-xl border border-dashed px-4 py-12 text-center">
				<ReceiptText className="mx-auto size-8 text-muted-foreground" />
				<h3 className="mt-3 font-medium">No transactions found</h3>
				<p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	const grid = compact ? "" : GRID;

	return (
		<IndividualEditProvider players={players}>
			<div className="overflow-hidden rounded-xl border bg-card">
				{!compact && (
					<div
						className={`hidden border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground ${GRID}`}>
						<span>Transaction</span>
						<span>Kind</span>
						<span>Date</span>
						<span>Status</span>
						<span className="text-right">Amount</span>
						<span />
					</div>
				)}

				<ul className="divide-y">
					{rows.map((row) => {
						const isDraft = row.status === "DRAFT";
						const content = (
							<>
								{/* icon, name, who (+ kind and date when stacked) */}
								<div className="flex min-w-0 flex-1 items-center gap-3">
									<TransactionKindIcon kind={row.kind} />
									<div className="min-w-0">
										<p className="truncate font-medium">{row.name}</p>
										<p className="truncate text-sm text-muted-foreground">{row.who}</p>
										<p
											className={`mt-0.5 text-xs text-muted-foreground ${compact ? "" : "md:hidden"}`}>
											{TRANSACTION_KIND_LABELS[row.kind]} · {POT_LABELS[row.pot]} · {formatDate(row.date)}
										</p>
									</div>
								</div>

								{/* stacked: amount and status on the right */}
								<div
									className={`flex shrink-0 flex-col items-end gap-1 ${compact ? "" : "md:hidden"}`}>
									<Amount amount={row.amount} muted={isDraft} />
									<StatusBadge status={row.status} />
								</div>

								{/* desktop table columns */}
								{!compact && (
									<>
										<span className="hidden text-sm text-muted-foreground md:block">
											{TRANSACTION_KIND_LABELS[row.kind]}
											<span className="block text-xs">{POT_LABELS[row.pot]} pot</span>
										</span>
										<span className="hidden text-sm text-muted-foreground md:block">
											{formatDate(row.date)}
										</span>
										<span className="hidden md:block">
											<StatusBadge status={row.status} />
										</span>
										<span className="hidden text-right md:block">
											<Amount amount={row.amount} muted={isDraft} />
										</span>
										<ChevronRight className="hidden size-4 text-muted-foreground md:block" />
									</>
								)}
							</>
						);

						const rowClass = `flex items-center gap-3 px-4 py-3 sm:px-5 ${grid}`;
						const interactive =
							"transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none";

						return (
							<li key={row.key}>
								{row.individual ? (
									<IndividualRowButton
										transaction={row.individual}
										className={`${rowClass} ${interactive}`}>
										{content}
									</IndividualRowButton>
								) : row.href ? (
									<Link href={row.href} className={`${rowClass} ${interactive}`}>
										{content}
									</Link>
								) : (
									<div className={rowClass}>{content}</div>
								)}
							</li>
						);
					})}
				</ul>
			</div>
		</IndividualEditProvider>
	);
}
