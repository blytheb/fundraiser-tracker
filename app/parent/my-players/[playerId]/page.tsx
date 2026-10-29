import {
	ArrowDownLeft,
	ArrowUpRight,
	CalendarDays,
	CircleDollarSign,
	History,
	Wallet,
} from "lucide-react";
import Image from "next/image";
import { getPlayerFinancialSummary } from "@/features/players/data/get-player-financial-summary";

type PlayerPageProps = {
	params: Promise<{
		playerId: string;
	}>;
};

const currency = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

function formatDate(date: Date) {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default async function PlayerPage({ params }: PlayerPageProps) {
	const { playerId } = await params;
	const playerSummary = await getPlayerFinancialSummary(playerId);

	return (
		<main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:py-10">
			{/* Player overview */}
			<section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					{playerSummary.player.imageUrl ? (
						<Image
							src={playerSummary.player.imageUrl}
							alt={`${playerSummary.initials}`}
							className="size-20 rounded-full border object-cover"
						/>
					) : (
						<div className="flex size-20 items-center justify-center rounded-full bg-muted text-xl font-semibold">
							{playerSummary.initials}
						</div>
					)}

					<div className="space-y-1">
						<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
							{playerSummary.player.firstName} {playerSummary.player.lastName}
						</h1>

						<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
							{playerSummary.teams.length > 0 ? (
								playerSummary.teams.map((team) => (
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
						playerSummary.player.status
							? "bg-green-100 text-green-800"
							: "bg-muted text-muted-foreground"
					}`}>
					{playerSummary.player.status ? "Active Player" : "Inactive Player"}
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
							playerSummary.currentBalance < 0 ? "text-destructive" : ""
						}`}>
						{currency.format(playerSummary.currentBalance)}
					</p>

					<p className="mt-2 text-sm text-muted-foreground">
						Calculated from active player transactions
					</p>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<div className="rounded-xl border bg-card p-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<ArrowDownLeft className="size-4 text-green-600" />
							Money In
						</div>
						<p className="mt-2 text-xl font-semibold">
							{currency.format(playerSummary.totalMoneyIn)}
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Deposits and fundraiser distributions
						</p>
					</div>

					<div className="rounded-xl border bg-card p-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<ArrowUpRight className="size-4 text-destructive" />
							Money Out
						</div>
						<p className="mt-2 text-xl font-semibold">
							{currency.format(playerSummary.totalMoneyOut)}
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Expenses and negative adjustments
						</p>
					</div>

					<div className="rounded-xl border bg-card p-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<CircleDollarSign className="size-4" />
							Fundraiser Earnings
						</div>
						<p className="mt-2 text-xl font-semibold">
							{currency.format(playerSummary.totalDistributions)}
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Finalized distributions only
						</p>
					</div>
				</div>
			</section>

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

				{playerSummary.history.length === 0 ? (
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
							{playerSummary.history.map((entry) => (
								<div
									key={entry.id}
									className="flex flex-col gap-3 px-4 py-4 sm:grid sm:grid-cols-[minmax(0,1fr)_140px_140px] sm:items-center sm:gap-4 sm:px-5">
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
											{entry.type === "EXPENSE" ? (
												<ArrowUpRight className="size-5 text-destructive" />
											) : entry.type === "DISTRIBUTION" ? (
												<CircleDollarSign className="size-5 text-green-600" />
											) : entry.type === "PAYMENT" ? (
												<ArrowDownLeft className="size-5 text-green-600" />
											) : (
												<Wallet className="size-5 text-muted-foreground" />
											)}
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
										{currency.format(entry.amount)}
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
