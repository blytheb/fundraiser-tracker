import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import type { Player } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import ManageRosterDialog from "@/components/forms/teams/ManageRosterDialog";
import AddFundraiserToTeamDialog from "@/components/forms/teams/AddFundraiserToTeamDialog";
import TeamActions from "@/features/teams/TeamActions";
import TeamRosterList from "@/features/teams/TeamRosterList";
import TransactionFeed from "@/features/transactions/TransactionFeed";

import { getTeamById } from "@/features/teams/data/teams";
import { getTeamPlayers } from "@/features/teams/data/get-team-players";
import { getAvailablePlayersForTeam } from "@/features/teams/data/get-available-players-for-team";
import { getAvailableFundraisersForTeam } from "@/features/fundraisers/data/fundraiserTeams";
import { getPlayerBalances } from "@/features/players/data/players";
import { getTransactionFeed } from "@/features/transactions/data/get-transaction-feed";
import { formatCurrency } from "@/lib/format";
import { TEAM_STATUS_LABELS } from "@/lib/labels";

type TeamPageProps = {
	params: Promise<{ teamId: string }>;
	searchParams: Promise<{ tab?: string }>;
};

const toPickerPlayer = (player: Player) => ({
	id: player.id,
	firstName: player.firstName,
	lastName: player.lastName,
	name: `${player.firstName} ${player.lastName}`,
	status: player.status,
});

export default async function TeamPage({ params, searchParams }: TeamPageProps) {
	const { teamId } = await params;
	const { tab } = await searchParams;
	const activeTab = tab === "transactions" ? "transactions" : "roster";

	const [team, players, availablePlayers, availableFundraisers, feed] = await Promise.all([
		getTeamById(teamId),
		getTeamPlayers(teamId),
		getAvailablePlayersForTeam(teamId),
		getAvailableFundraisersForTeam(teamId),
		getTransactionFeed({ teamId }),
	]);

	if (!team) notFound();

	const balances = await getPlayerBalances(players.map((p) => p.id));
	const isActive = team.status === "IN_SEASON";
	const { totals } = feed;

	// On phones the roster and transactions are tabs (?tab=); on large screens both show.
	const tabHref = (value: "roster" | "transactions") =>
		value === "roster" ? `/admin/teams/${teamId}` : `/admin/teams/${teamId}?tab=transactions`;

	return (
		<main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6 lg:py-8">
			<Link
				href="/admin/teams"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft className="size-4" />
				Teams
			</Link>

			{/* ---------- Header ---------- */}
			<section className="rounded-xl border bg-card p-4 sm:p-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0 space-y-1.5">
						<h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{team.name}</h1>
						<Badge variant={isActive ? "default" : "secondary"}>
							{TEAM_STATUS_LABELS[team.status]}
						</Badge>
					</div>
					<TeamActions team={team} />
				</div>

				<dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4">
					<Stat label="Players" value={String(players.length)} />
					<Stat label="Income" value={formatCurrency(totals.income)} tone="text-green-700" />
					<Stat label="Expenses" value={formatCurrency(-totals.expenses)} tone="text-destructive" />
					<Stat
						label="Net"
						value={formatCurrency(totals.net)}
						tone={totals.net < 0 ? "text-destructive" : ""}
					/>
				</dl>
				<p className="mt-2 text-xs text-muted-foreground">
					Team income and expenses that are Final or Shared (drafts excluded).
				</p>
			</section>

			{/* ---------- Tabs (phones only) ---------- */}
			<nav aria-label="Team sections" className="grid grid-cols-2 gap-1 rounded-lg border bg-muted p-1 lg:hidden">
				{(["roster", "transactions"] as const).map((value) => (
					<Link
						key={value}
						href={tabHref(value)}
						scroll={false}
						aria-current={activeTab === value ? "page" : undefined}
						className={`flex h-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
							activeTab === value
								? "bg-background shadow-sm"
								: "text-muted-foreground hover:bg-background/60"
						}`}>
						{value === "roster"
							? `Roster (${players.length})`
							: `Transactions (${feed.rows.length})`}
					</Link>
				))}
			</nav>

			{/* ---------- Roster | Transactions ---------- */}
			<div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
				<section
					aria-labelledby="roster-heading"
					className={`space-y-3 ${activeTab === "roster" ? "" : "hidden lg:block"}`}>
					<div className="flex items-center justify-between gap-3">
						<h2 id="roster-heading" className="text-lg font-semibold">
							Roster
						</h2>
						<ManageRosterDialog
							teamId={team.id}
							teamName={team.name}
							roster={players.map(toPickerPlayer)}
							available={availablePlayers.map(toPickerPlayer)}
						/>
					</div>
					<TeamRosterList players={players} balances={balances} />
				</section>

				<section
					aria-labelledby="transactions-heading"
					className={`space-y-3 ${activeTab === "transactions" ? "" : "hidden lg:block"}`}>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h2 id="transactions-heading" className="text-lg font-semibold">
							Team transactions
						</h2>
						<div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
							<Link
								href={`/admin/transactions/team/new?direction=INCOME&team=${team.id}`}
								className={buttonVariants({ variant: "outline", size: "sm" })}>
								<Plus />
								Team income
							</Link>
							<Link
								href={`/admin/transactions/team/new?direction=EXPENSE&team=${team.id}`}
								className={buttonVariants({ variant: "outline", size: "sm" })}>
								<Plus />
								Team expense
							</Link>
						</div>
					</div>
					<TransactionFeed
						rows={feed.rows}
						compact
						emptyMessage="Add team income or a team expense for this team."
					/>
					<div className="flex justify-end">
						<AddFundraiserToTeamDialog teamId={team.id} availableFundraisers={availableFundraisers} />
					</div>
				</section>
			</div>
		</main>
	);
}

function Stat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
	return (
		<div className="min-w-0">
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd className={`truncate text-lg font-semibold tabular-nums ${tone}`}>{value}</dd>
		</div>
	);
}
