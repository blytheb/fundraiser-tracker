import type { ReactNode } from "react";
import {
	ArrowDownLeft,
	ArrowUpRight,
	CalendarDays,
	CircleDollarSign,
	History,
	Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PlayerFinancialSummary } from "@/features/players/lib/summarize-transactions";
import type { PlayerTransactionType } from "@prisma/client";

type PlayerFinancialViewProps = {
	player: {
		firstName: string;
		lastName: string;
		imageUrl: string | null;
		status: boolean;
	};
	teams: { id: string; name: string }[];
	summary: PlayerFinancialSummary;
	// extra content between the balance and the history, e.g. the admin transaction form
	children?: ReactNode;
};

const ENTRY_ICONS: Record<PlayerTransactionType, ReactNode> = {
	EXPENSE: <ArrowUpRight className="size-5 text-destructive" />,
	DISTRIBUTION: <CircleDollarSign className="size-5 text-green-600" />,
	PAYMENT: <ArrowDownLeft className="size-5 text-green-600" />,
	ADJUSTMENT: <Wallet className="size-5 text-muted-foreground" />,
};

// Shared by the admin and parent player pages. Each page loads the data with
// its own access check; this component only renders it.
export default function PlayerFinancialView({
	player,
	teams,
	summary,
	children,
}: PlayerFinancialViewProps) {
	const fullName = `${player.firstName} ${player.lastName}`;
	const initials =
		`${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();

	return (
		<main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:py-10">
			{/* Player overview */}
			<section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					{/* falls back to initials when there's no photo or it fails to load */}
					<Avatar className="size-20">
						{player.imageUrl && (
							<AvatarImage src={player.imageUrl} alt={fullName} />
						)}
						<AvatarFallback className="text-xl font-semibold">
							{initials}
						</AvatarFallback>
					</Avatar>

					<div className="space-y-1">
						<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
							{fullName}
						</h1>

						<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
							{teams.length > 0 ? (
								teams.map((team) => (
									<span key={team.id} className="rounded-full border px-3 py-1">
										{team.name}
									</span>
								))
							) : (
								<span>No teams assigned</span>
							)}
						</div>
					</div>
				</div>

				<span
					className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
						player.status
							? "bg-green-100 text-green-800"
							: "bg-muted text-muted-foreground"
					}`}>
					{player.status ? "Active Player" : "Inactive Player"}
				</span>
			</section>

			{/* Financial overview */}
			<section className="space-y-4">
				<div className="rounded-xl border bg-card p-5 sm:p-7">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Wallet className="size-5" />
						Current Balance
					</div>

					<p
						className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${
							summary.currentBalance < 0 ? "text-destructive" : ""
						}`}>
						{formatCurrency(summary.currentBalance)}
					</p>

					<p className="mt-2 text-sm text-muted-foreground">
						Calculated from active player transactions
					</p>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<StatCard
						icon={<ArrowDownLeft className="size-4 text-green-600" />}
						label="Money In"
						value={summary.totalMoneyIn}
						hint="Deposits and fundraiser distributions"
					/>
					<StatCard
						icon={<ArrowUpRight className="size-4 text-destructive" />}
						label="Money Out"
						value={summary.totalMoneyOut}
						hint="Expenses and negative adjustments"
					/>
					<StatCard
						icon={<CircleDollarSign className="size-4" />}
						label="Fundraiser Earnings"
						value={summary.totalDistributions}
						hint="Finalized distributions only"
					/>
				</div>
			</section>

			{children}

			{/* Unified transaction history */}
			<section className="space-y-4">
				<div className="flex items-center gap-3">
					<History className="size-5 text-muted-foreground" />
					<div>
						<h2 className="text-lg font-semibold">Transaction History</h2>
						<p className="text-sm text-muted-foreground">
							All-time deposits, expenses, distributions, and adjustments
						</p>
					</div>
				</div>

				{summary.history.length === 0 ? (
					<div className="rounded-xl border border-dashed px-4 py-12 text-center">
						<CalendarDays className="mx-auto size-8 text-muted-foreground" />
						<h3 className="mt-3 font-medium">No transactions yet</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Financial activity will appear here when transactions are
							recorded.
						</p>
					</div>
				) : (
					<div className="overflow-hidden rounded-xl border">
						<div className="hidden grid-cols-[minmax(0,1fr)_140px_140px] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
							<span>Transaction</span>
							<span>Date</span>
							<span className="text-right">Amount</span>
						</div>

						<div className="divide-y">
							{summary.history.map((entry) => (
								<div
									key={entry.id}
									className="flex flex-col gap-3 px-4 py-4 sm:grid sm:grid-cols-[minmax(0,1fr)_140px_140px] sm:items-center sm:gap-4 sm:px-5">
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
											{ENTRY_ICONS[entry.type]}
										</div>

										<div className="min-w-0">
											<p className="truncate font-medium">{entry.title}</p>
											<p className="mt-1 text-sm text-muted-foreground">
												{entry.description}
											</p>
											<p className="mt-1 text-xs text-muted-foreground sm:hidden">
												{formatDate(entry.date)}
											</p>
										</div>
									</div>

									<p className="hidden text-sm text-muted-foreground sm:block">
										{formatDate(entry.date)}
									</p>

									<p
										className={`text-right font-semibold ${
											entry.amount > 0
												? "text-green-700"
												: entry.amount < 0
													? "text-destructive"
													: ""
										}`}>
										{entry.amount > 0 ? "+" : ""}
										{formatCurrency(entry.amount)}
									</p>
								</div>
							))}
						</div>
					</div>
				)}
			</section>
		</main>
	);
}

function StatCard({
	icon,
	label,
	value,
	hint,
}: {
	icon: ReactNode;
	label: string;
	value: number;
	hint: string;
}) {
	return (
		<div className="rounded-xl border bg-card p-4">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				{icon}
				{label}
			</div>
			<p className="mt-2 text-xl font-semibold">{formatCurrency(value)}</p>
			<p className="mt-1 text-xs text-muted-foreground">{hint}</p>
		</div>
	);
}
