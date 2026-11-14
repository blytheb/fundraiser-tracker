import Link from "next/link";
import type { ReactNode } from "react";
import {
	ArrowRight,
	ClipboardCheck,
	FilePen,
	Landmark,
	TrendingDown,
	TrendingUp,
	UserMinus,
	Users,
	EyeOff,
} from "lucide-react";

import { getAdminDashboard } from "@/features/dashboard/data/get-admin-dashboard";
import { getActivePlayerOptions } from "@/features/players/data/players";
import AddTeamDialog from "@/components/forms/teams/AddTeamDialog";
import NewTransactionMenu from "@/features/transactions/NewTransactionMenu";
import TransactionFeed from "@/features/transactions/TransactionFeed";
import { formatCurrency } from "@/lib/format";

export default async function AdminDashboardPage() {
	const [data, players] = await Promise.all([getAdminDashboard(), getActivePlayerOptions()]);
	const { money } = data;

	const attention = [
		{
			show: data.draftCount > 0,
			icon: <FilePen className="size-4" />,
			label: `${data.draftCount} draft team ${data.draftCount === 1 ? "transaction" : "transactions"}`,
			hint: "Not counted until finalized",
			href: "/admin/transactions?status=DRAFT",
		},
		{
			show: data.finalNotSharedCount > 0,
			icon: <EyeOff className="size-4" />,
			label: `${data.finalNotSharedCount} not shared with parents`,
			hint: "Final, but parents can't see them yet",
			href: "/admin/transactions?status=COMPLETED",
		},
		{
			show: data.pendingAccessRequestCount > 0,
			icon: <ClipboardCheck className="size-4" />,
			label: `${data.pendingAccessRequestCount} access ${data.pendingAccessRequestCount === 1 ? "request" : "requests"}`,
			hint: "Parents waiting for approval",
			href: "/admin/access-requests",
		},
	].filter((item) => item.show);

	return (
		<main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
			{/* ---------- Header ---------- */}
			<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-medium text-muted-foreground">Menehune Basketball</p>
					<h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
				</div>
				<div className="grid grid-cols-2 gap-2 sm:flex">
					<NewTransactionMenu players={players} />
					<AddTeamDialog players={players} />
				</div>
			</header>

			{/* ---------- Key figures ---------- */}
			<section aria-label="Key figures" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<Figure
					icon={<Landmark className="size-4" />}
					label="Held for players"
					value={formatCurrency(money.heldForPlayers)}
					hint="Should match the bank"
					tone={money.heldForPlayers < 0 ? "text-destructive" : ""}
					href="/admin/transactions"
				/>
				<Figure
					icon={<TrendingUp className="size-4" />}
					label="Income"
					value={formatCurrency(money.income)}
					hint="Individual + team"
					tone="text-green-700"
				/>
				<Figure
					icon={<TrendingDown className="size-4" />}
					label="Expenses"
					value={formatCurrency(-money.expenses)}
					hint="Individual + team"
					tone="text-destructive"
				/>
				<Figure
					icon={<Users className="size-4" />}
					label="Active players"
					value={String(data.activePlayerCount)}
					hint={`${data.inSeasonTeamCount} ${data.inSeasonTeamCount === 1 ? "team" : "teams"} in season`}
					href="/admin/players"
				/>
			</section>

			{/* ---------- Held per pot ---------- */}
			<section aria-label="Held per pot" className="flex flex-wrap gap-2 text-sm">
				{data.pots.map((pot) => (
					<span key={pot.pot} className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1">
						<span className="text-muted-foreground">{pot.label}</span>
						<span
							className={`font-semibold tabular-nums ${pot.amount < 0 ? "text-destructive" : ""}`}>
							{formatCurrency(pot.amount)}
						</span>
					</span>
				))}
			</section>

			<div className="space-y-6 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6 lg:space-y-0">
				{/* ---------- Recent transactions ---------- */}
				<section className="space-y-3 lg:col-span-2">
					<SectionHeader title="Recent transactions" href="/admin/transactions" linkLabel="View all" />
					<TransactionFeed
						rows={data.recent}
						players={players}
						emptyMessage="Use New transaction to record income or an expense."
					/>
				</section>

				{/* ---------- Needs attention + players below zero ---------- */}
				<aside className="space-y-6">
					<section className="space-y-3">
						<SectionHeader title="Needs attention" />
						{attention.length === 0 ? (
							<p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
								You&apos;re all caught up.
							</p>
						) : (
							<ul className="divide-y overflow-hidden rounded-xl border bg-card">
								{attention.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href}
											className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none">
											<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
												{item.icon}
											</span>
											<span className="min-w-0 flex-1">
												<span className="block truncate text-sm font-medium">{item.label}</span>
												<span className="block truncate text-xs text-muted-foreground">
													{item.hint}
												</span>
											</span>
											<ArrowRight className="size-4 shrink-0 text-muted-foreground" />
										</Link>
									</li>
								))}
							</ul>
						)}
					</section>

					<section className="space-y-3">
						<SectionHeader
							title={`Below zero${data.negativeBalanceCount ? ` (${data.negativeBalanceCount})` : ""}`}
						/>
						{data.mostNegative.length === 0 ? (
							<p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
								No players have a negative balance.
							</p>
						) : (
							<ul className="divide-y overflow-hidden rounded-xl border bg-card">
								{data.mostNegative.map((player) => (
									<li key={player.id}>
										<Link
											href={`/admin/players/${player.id}`}
											className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none">
											<UserMinus className="size-4 shrink-0 text-muted-foreground" />
											<span className="min-w-0 flex-1 truncate text-sm font-medium">{player.name}</span>
											<span className="shrink-0 text-sm font-semibold tabular-nums text-destructive">
												{formatCurrency(player.balance)}
											</span>
										</Link>
									</li>
								))}
							</ul>
						)}
					</section>
				</aside>
			</div>
		</main>
	);
}

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<h2 className="text-lg font-semibold tracking-tight">{title}</h2>
			{href && (
				<Link
					href={href}
					className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
					{linkLabel}
					<ArrowRight className="size-3.5" />
				</Link>
			)}
		</div>
	);
}

function Figure({
	icon,
	label,
	value,
	hint,
	tone = "",
	href,
}: {
	icon: ReactNode;
	label: string;
	value: string;
	hint: string;
	tone?: string;
	href?: string;
}) {
	const body = (
		<>
			<div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
				{icon}
				<span className="truncate">{label}</span>
			</div>
			<p className={`mt-2 truncate text-xl font-bold tabular-nums sm:text-2xl ${tone}`}>{value}</p>
			<p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
		</>
	);
	const box = "block rounded-xl border bg-card p-3 sm:p-4";
	return href ? (
		<Link href={href} className={`${box} transition-colors hover:bg-muted/50`}>
			{body}
		</Link>
	) : (
		<div className={box}>{body}</div>
	);
}
