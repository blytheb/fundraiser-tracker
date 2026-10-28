import {
	ArrowDownLeft,
	ArrowUpRight,
	CalendarDays,
	CircleDollarSign,
	History,
	Wallet,
} from "lucide-react";
import { notFound } from "next/navigation";

import {
	getPlayerById,
	getPlayerTransactions,
} from "@/features/players/data/players";
import { getPlayerTeams } from "@/features/players/data/get-player-teams";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import PlayerTransactionForm from "@/components/forms/players/PlayerTransactionForm";

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
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const isAdmin = session?.user?.role === "ADMIN";
	let player;

	try {
		player = await getPlayerById(playerId);
	} catch {
		notFound();
	}

	if (!player) notFound();

	const [teams, transactions] = await Promise.all([
		getPlayerTeams(playerId),
		getPlayerTransactions(playerId),
	]);

	// Only active transactions affect the player's balance.
	const activeTransactions = transactions.filter(
		(transaction) => transaction.status === "ACTIVE",
	);

	const totalDeposits = activeTransactions
		.filter((transaction) => transaction.type === "PAYMENT")
		.reduce(
			(total, transaction) => total + Math.abs(Number(transaction.amount)),
			0,
		);

	const totalDistributions = activeTransactions
		.filter((transaction) => transaction.type === "DISTRIBUTION")
		.reduce(
			(total, transaction) => total + Math.abs(Number(transaction.amount)),
			0,
		);

	const totalExpenses = activeTransactions
		.filter((transaction) => transaction.type === "EXPENSE")
		.reduce(
			(total, transaction) => total + Math.abs(Number(transaction.amount)),
			0,
		);

	const adjustmentBalance = activeTransactions
		.filter((transaction) => transaction.type === "ADJUSTMENT")
		.reduce((total, transaction) => total + Number(transaction.amount), 0);

	const totalMoneyIn =
		totalDeposits +
		totalDistributions +
		activeTransactions
			.filter(
				(transaction) =>
					transaction.type === "ADJUSTMENT" && Number(transaction.amount) > 0,
			)
			.reduce((total, transaction) => total + Number(transaction.amount), 0);

	const totalMoneyOut =
		totalExpenses +
		Math.abs(
			activeTransactions
				.filter(
					(transaction) =>
						transaction.type === "ADJUSTMENT" && Number(transaction.amount) < 0,
				)
				.reduce((total, transaction) => total + Number(transaction.amount), 0),
		);

	const currentBalance = totalMoneyIn - totalMoneyOut;

	const history = activeTransactions
		.map((transaction) => {
			const amount = Number(transaction.amount);

			const title =
				transaction.type === "DISTRIBUTION"
					? (transaction.fundraiser?.name ?? "Fundraiser Distribution")
					: transaction.type === "PAYMENT"
						? "Player Deposit"
						: transaction.type === "EXPENSE"
							? "Player Expense"
							: "Balance Adjustment";

			const signedAmount =
				transaction.type === "EXPENSE"
					? -Math.abs(amount)
					: transaction.type === "ADJUSTMENT"
						? amount
						: Math.abs(amount);

			const description =
				transaction.description ??
				(transaction.type === "DISTRIBUTION"
					? "Fundraiser distribution"
					: transaction.type === "PAYMENT"
						? "Individual deposit"
						: transaction.type === "EXPENSE"
							? "Individual expense"
							: "Balance adjustment");

			return {
				id: transaction.id,
				title,
				description,
				date: transaction.date,
				type: transaction.type,
				amount: signedAmount,
			};
		})
		.sort((a, b) => b.date.getTime() - a.date.getTime());

	const initials =
		`${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();

	return (
		<main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:py-10">
			{/* Player overview */}
			<section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					{player.imageUrl ? (
						<img
							src={player.imageUrl}
							alt={`${player.firstName} ${player.lastName}`}
							className="size-20 rounded-full border object-cover"
						/>
					) : (
						<div className="flex size-20 items-center justify-center rounded-full bg-muted text-xl font-semibold">
							{initials}
						</div>
					)}

					<div className="space-y-1">
						<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
							{player.firstName} {player.lastName}
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
				<div>
					<h2 className="text-lg font-semibold">Financial Overview</h2>
					<p className="text-sm text-muted-foreground">
						All-time financial activity across seasons
					</p>
				</div>

				<div className="rounded-xl border bg-card p-5 sm:p-7">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Wallet className="size-5" />
						Current Balance
					</div>

					<p
						className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${
							currentBalance < 0 ? "text-destructive" : ""
						}`}>
						{currency.format(currentBalance)}
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
							{currency.format(totalMoneyIn)}
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
							{currency.format(totalMoneyOut)}
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
							{currency.format(totalDistributions)}
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Finalized distributions only
						</p>
					</div>
				</div>
			</section>
			{isAdmin && <PlayerTransactionForm playerId={playerId} />}

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

				{history.length === 0 ? (
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
							{history.map((entry) => (
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
