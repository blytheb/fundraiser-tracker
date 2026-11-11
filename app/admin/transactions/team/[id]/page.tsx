import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import FundraiserStatusBadge from "@/components/reusable/FundraiserStatusBadge";
import TransactionKindIcon from "@/components/reusable/TransactionKindIcon";
import TeamTransactionActions from "@/features/transactions/TeamTransactionActions";
import { getTeamTransaction } from "@/features/transactions/data/get-team-transaction";
import { formatCurrency, formatDate } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, TRANSACTION_KIND_LABELS } from "@/lib/labels";

type PageProps = {
	params: Promise<{ id: string }>;
};

const STATUS_HELP = {
	DRAFT: "Not counted yet. Complete it when the split is final.",
	COMPLETED: "Counted in balances and reports. Parents can't see it until it's published.",
	PUBLISHED: "Visible to parents on each player's page.",
} as const;

export default async function TeamTransactionPage({ params }: PageProps) {
	const { id } = await params;
	const t = await getTeamTransaction(id);

	if (!t) notFound();

	const kind = t.direction === "INCOME" ? "TEAM_INCOME" : "TEAM_EXPENSE";
	const remaining = t.total - t.shared;
	const isBalanced = t.total > 0 && Math.abs(remaining) < 0.005 && t.shares.length > 0;

	return (
		<main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:py-8">
			<Link
				href="/admin/transactions"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft className="size-4" />
				Transactions
			</Link>

			{/* Overview */}
			<section className="space-y-4 rounded-xl border bg-card p-4 sm:p-6">
				<div className="flex items-start gap-3">
					<TransactionKindIcon kind={kind} className="size-12" />
					<div className="min-w-0 flex-1 space-y-1">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-sm text-muted-foreground">
								{TRANSACTION_KIND_LABELS[kind]}
							</span>
							<FundraiserStatusBadge status={t.status} />
						</div>
						<h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">
							{t.name}
						</h1>
						<p className="text-sm text-muted-foreground">
							{formatDate(t.date)} · {PAYMENT_METHOD_LABELS[t.paymentMethod]}
							{t.teams.length > 0 && <> · {t.teams.map((team) => team.name).join(", ")}</>}
						</p>
						{t.description && <p className="pt-1 text-sm">{t.description}</p>}
					</div>
				</div>

				<p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
					{STATUS_HELP[t.status]}
				</p>

				<TeamTransactionActions
					id={t.id}
					status={t.status}
					isBalanced={isBalanced}
					hasHistory={t.hasHistory}
				/>
			</section>

			{/* Totals */}
			<section aria-label="Totals" className="grid grid-cols-3 gap-2 sm:gap-3">
				<Stat label="Total" value={formatCurrency(t.total)} />
				<Stat label="Shared" value={formatCurrency(t.shared)} />
				<Stat
					label="Remaining"
					value={formatCurrency(remaining)}
					tone={isBalanced ? "text-green-700" : "text-destructive"}
				/>
			</section>

			{/* Split */}
			<section className="overflow-hidden rounded-xl border bg-card">
				<div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3 sm:px-5">
					<h2 className="font-semibold">Player shares</h2>
					<span className="text-sm text-muted-foreground">
						{t.shares.length} {t.shares.length === 1 ? "player" : "players"}
					</span>
				</div>
				{t.shares.length === 0 ? (
					<p className="px-4 py-8 text-center text-sm text-muted-foreground">
						No players yet. Edit the draft to choose teams and players.
					</p>
				) : (
					<ul className="divide-y">
						{t.shares.map((share) => (
							<li
								key={share.playerId}
								className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
								<Link
									href={`/admin/players/${share.playerId}`}
									className="truncate font-medium hover:underline">
									{share.name}
								</Link>
								<span
									className={`shrink-0 font-semibold tabular-nums ${
										t.direction === "INCOME" ? "text-green-700" : "text-destructive"
									}`}>
									{t.direction === "INCOME" ? "+" : "−"}
									{formatCurrency(share.amount)}
								</span>
							</li>
						))}
					</ul>
				)}
			</section>
		</main>
	);
}

function Stat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
	return (
		<div className="rounded-xl border bg-card p-3 sm:p-4">
			<p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
			<p className={`mt-1 truncate text-base font-semibold tabular-nums sm:text-xl ${tone}`}>
				{value}
			</p>
		</div>
	);
}
