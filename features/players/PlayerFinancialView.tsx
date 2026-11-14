import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, History, Wallet } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TransactionKindIcon from "@/components/reusable/TransactionKindIcon";
import {
	IndividualEditProvider,
	IndividualRowButton,
} from "@/features/transactions/IndividualEditContext";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PlayerFinancialSummary } from "@/features/players/lib/summarize-transactions";

export type HistoryFilter = "all" | "income" | "expenses" | "team";

const FILTERS: { value: HistoryFilter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "income", label: "Income" },
	{ value: "expenses", label: "Expenses" },
	{ value: "team", label: "Team" },
];

export function parseHistoryFilter(value?: string): HistoryFilter {
	return FILTERS.some((f) => f.value === value) ? (value as HistoryFilter) : "all";
}

type PlayerOption = { id: string; name: string };

type Props = {
	mode: "admin" | "parent";
	player: {
		id: string;
		firstName: string;
		lastName: string;
		imageUrl: string | null;
		status: boolean;
	};
	teams: { id: string; name: string }[];
	summary: PlayerFinancialSummary;
	filter: HistoryFilter;
	basePath: string; // this page's path, for the filter links
	actions?: ReactNode; // admin: Edit / Delete
	addButton?: ReactNode; // admin: Add transaction
	editPlayers?: PlayerOption[]; // admin: lets individual rows open the edit dialog
};

type Entry = PlayerFinancialSummary["history"][number];

function matchesFilter(entry: Entry, filter: HistoryFilter) {
	switch (filter) {
		case "income":
			return entry.direction === "INCOME";
		case "expenses":
			return entry.direction === "EXPENSE";
		case "team":
			return entry.kind === "TEAM_INCOME" || entry.kind === "TEAM_EXPENSE";
		default:
			return true;
	}
}

// Shared by the admin and parent player pages. Each page loads the data with its
// own access check. Phone: one column. Large screens: summary on the left (stays
// in view while scrolling), history on the right.
export default function PlayerFinancialView({
	mode,
	player,
	teams,
	summary,
	filter,
	basePath,
	actions,
	addButton,
	editPlayers,
}: Props) {
	const isAdmin = mode === "admin";
	const fullName = `${player.firstName} ${player.lastName}`;
	const initials = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();
	const entries = summary.history.filter((entry) => matchesFilter(entry, filter));

	const history = <HistoryList entries={entries} isAdmin={isAdmin} filter={filter} />;

	return (
		<main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
			<div className="space-y-6 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
				{/* ---------- Summary (left on large screens) ---------- */}
				<aside className="space-y-4 lg:sticky lg:top-6">
					<section className="rounded-xl border bg-card p-4 sm:p-5">
						<div className="flex items-center gap-4">
							<Avatar className="size-16 shrink-0">
								{player.imageUrl && <AvatarImage src={player.imageUrl} alt={fullName} />}
								<AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
							</Avatar>
							<div className="min-w-0 space-y-1.5">
								<h1 className="truncate text-2xl font-bold tracking-tight">{fullName}</h1>
								<span
									className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
										player.status
											? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
											: "bg-muted text-muted-foreground"
									}`}>
									{player.status ? "Active" : "Inactive"}
								</span>
							</div>
						</div>

						<div className="mt-4 flex flex-wrap gap-2">
							{teams.length === 0 ? (
								<span className="text-sm text-muted-foreground">No teams</span>
							) : (
								teams.map((team) =>
									isAdmin ? (
										<Link
											key={team.id}
											href={`/admin/teams/${team.id}`}
											className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm hover:bg-muted">
											{team.name}
											<ChevronRight className="size-3.5 text-muted-foreground" />
										</Link>
									) : (
										<span key={team.id} className="rounded-full border px-3 py-1 text-sm">
											{team.name}
										</span>
									),
								)
							)}
						</div>

						{actions && <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">{actions}</div>}
					</section>

					<section className="rounded-xl border bg-card p-4 sm:p-5" aria-label="Balance">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Wallet className="size-4" />
							Current balance
						</div>
						<p
							className={`mt-2 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl ${
								summary.currentBalance < 0 ? "text-destructive" : ""
							}`}>
							{formatCurrency(summary.currentBalance)}
						</p>
						{isAdmin && summary.notYetShared !== 0 && (
							<p className="mt-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
								Includes {formatCurrency(summary.notYetShared)} that isn&apos;t shared with parents
								yet.
							</p>
						)}

						<dl className="mt-4 space-y-2 border-t pt-4 text-sm">
							<Line label="Money in" value={summary.totalMoneyIn} tone="text-green-700" strong />
							<Line label="Individual" value={summary.individualIncome} indent />
							<Line label="Team" value={summary.teamIncome} indent />
							<Line label="Money out" value={-summary.totalMoneyOut} tone="text-destructive" strong />
							<Line label="Individual" value={-summary.individualExpenses} indent />
							<Line label="Team" value={-summary.teamExpenses} indent />
						</dl>
					</section>
				</aside>

				{/* ---------- History (right on large screens) ---------- */}
				<section className="space-y-3">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2">
							<History className="size-5 text-muted-foreground" />
							<h2 className="text-lg font-semibold">History</h2>
							<span className="text-sm text-muted-foreground">({entries.length})</span>
						</div>
						{addButton}
					</div>

					<nav aria-label="Filter history" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
						<ul className="flex w-max gap-2">
							{FILTERS.map((option) => {
								const active = option.value === filter;
								const href =
									option.value === "all" ? basePath : `${basePath}?show=${option.value}`;
								return (
									<li key={option.value}>
										<Link
											href={href}
											scroll={false}
											aria-current={active ? "page" : undefined}
											className={`inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors ${
												active
													? "border-primary bg-primary text-primary-foreground"
													: "bg-background hover:bg-muted"
											}`}>
											{option.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>

					{isAdmin && editPlayers ? (
						<IndividualEditProvider players={editPlayers}>{history}</IndividualEditProvider>
					) : (
						history
					)}
				</section>
			</div>
		</main>
	);
}

function Line({
	label,
	value,
	tone = "",
	strong = false,
	indent = false,
}: {
	label: string;
	value: number;
	tone?: string;
	strong?: boolean;
	indent?: boolean;
}) {
	return (
		<div className={`flex justify-between gap-4 ${indent ? "pl-3 text-muted-foreground" : ""}`}>
			<dt className={strong ? "font-medium" : ""}>{label}</dt>
			<dd className={`tabular-nums ${strong ? `font-semibold ${tone}` : ""}`}>
				{value > 0 ? "+" : ""}
				{formatCurrency(value)}
			</dd>
		</div>
	);
}

function HistoryList({
	entries,
	isAdmin,
	filter,
}: {
	entries: Entry[];
	isAdmin: boolean;
	filter: HistoryFilter;
}) {
	if (entries.length === 0) {
		return (
			<div className="rounded-xl border border-dashed px-4 py-12 text-center">
				<h3 className="font-medium">
					{filter === "all" ? "No transactions yet" : "Nothing matches this filter"}
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					{filter === "all"
						? "Financial activity will appear here when transactions are recorded."
						: "Try another filter."}
				</p>
			</div>
		);
	}

	return (
		<ul className="divide-y overflow-hidden rounded-xl border bg-card">
			{entries.map((entry) => {
				const content = (
					<>
						<TransactionKindIcon kind={entry.kind} />
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium">{entry.title}</p>
							<p className="truncate text-sm text-muted-foreground">{entry.description}</p>
							<p className="mt-0.5 text-xs text-muted-foreground">{formatDate(entry.date)}</p>
						</div>
						<div className="flex shrink-0 flex-col items-end gap-1">
							<span
								className={`font-semibold tabular-nums ${
									entry.amount > 0
										? "text-green-700"
										: entry.amount < 0
											? "text-destructive"
											: ""
								}`}>
								{entry.amount > 0 ? "+" : ""}
								{formatCurrency(entry.amount)}
							</span>
							{isAdmin && !entry.shared && (
								<span
									className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
									title="Counted, but not shared with parents yet">
									Final
								</span>
							)}
						</div>
					</>
				);

				const rowClass = "flex items-center gap-3 px-4 py-3 sm:px-5";
				const interactive = `${rowClass} transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none`;

				if (isAdmin && entry.teamTransactionId) {
					return (
						<li key={entry.id}>
							<Link
								href={`/admin/transactions/team/${entry.teamTransactionId}`}
								className={interactive}>
								{content}
							</Link>
						</li>
					);
				}
				if (isAdmin && entry.playerId) {
					return (
						<li key={entry.id}>
							<IndividualRowButton
								className={interactive}
								transaction={{
									id: entry.id,
									playerId: entry.playerId,
									direction: entry.direction,
									amount: Math.abs(entry.amount),
									date: entry.date.toISOString().slice(0, 10),
									description: entry.note,
								}}>
								{content}
							</IndividualRowButton>
						</li>
					);
				}
				return (
					<li key={entry.id} className={rowClass}>
						{content}
					</li>
				);
			})}
		</ul>
	);
}
