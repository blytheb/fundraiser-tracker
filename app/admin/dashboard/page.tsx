import Link from "next/link";
import {
	ArrowRight,
	ClipboardCheck,
	FilePlus2,
	HandCoins,
	Users,
	Wallet,
} from "lucide-react";

import { requireAdmin } from "@/lib/permissions";
import { getAdminDashboardSummary } from "@/features/dashboard/data/get-admin-dashboard-summary";
import { getAdminFundraiserOverview } from "@/features/dashboard/data/get-admin-fundraiser-overview";

import AddFundraiserDialog from "@/components/forms/fundraisers/AddFundraiserDialog";
import AddTeamDialog from "@/components/forms/teams/AddTeamDialog";

function formatCurrency(amount: number) {
	return amount.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 2,
	});
}

function StatusBadge({ status }: { status: string }) {
	const styles: Record<string, string> = {
		Draft:
			"border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
		Completed:
			"border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
		Published:
			"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
	};

	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
				styles[status] ?? styles.Draft
			}`}>
			<span className="mr-1.5 size-1.5 rounded-full bg-current" />
			{status}
		</span>
	);
}

export default async function AdminPage() {
	await requireAdmin();

	const [summary, fundraisers] = await Promise.all([
		getAdminDashboardSummary(),
		getAdminFundraiserOverview(),
	]);

	const publishedPercentage =
		summary.totalFundraiserCount > 0
			? Math.round(
					(summary.publishedFundraiserCount / summary.totalFundraiserCount) *
						100,
				)
			: 0;

	return (
		<main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
			{/* Page header */}
			<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-sm font-medium text-muted-foreground">
						MENEHUNE BASKETBALL
					</p>
					<h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Manage your club, monitor fundraising, and keep things moving.
					</p>
				</div>

				<div className="shrink-0">
					<AddFundraiserDialog />
				</div>
			</header>

			{/* Overview metrics */}
			<section className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Club Overview
					</h2>
					<p className="text-sm text-muted-foreground">
						A snapshot of your club&apos;s current activity.
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<div className="rounded-xl border bg-card p-5 shadow-sm">
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-medium text-muted-foreground">
								Active Players
							</p>
							<div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
								<Users className="size-5" />
							</div>
						</div>
						<p className="mt-4 text-3xl font-bold tracking-tight">
							{summary.activePlayerCount}
						</p>
						<Link
							href="/admin/players"
							className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
							View players <ArrowRight className="size-3.5" />
						</Link>
					</div>

					<div className="rounded-xl border bg-card p-5 shadow-sm">
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-medium text-muted-foreground">
								Total Raised
							</p>
							<div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
								<HandCoins className="size-5" />
							</div>
						</div>
						<p className="mt-4 text-3xl font-bold tracking-tight">
							{formatCurrency(Number(summary.totalRaised))}
						</p>
						<p className="mt-3 text-sm text-muted-foreground">
							Recorded contributions
						</p>
					</div>

					<div className="rounded-xl border bg-card p-5 shadow-sm">
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-medium text-muted-foreground">
								Fundraisers
							</p>
							<div className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
								<Wallet className="size-5" />
							</div>
						</div>
						<p className="mt-4 text-3xl font-bold tracking-tight">
							{summary.totalFundraiserCount}
						</p>
						<div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
							<span>{summary.draftFundraiserCount} draft</span>
							<span>{summary.completedFundraiserCount} completed</span>
							<span>{summary.publishedFundraiserCount} published</span>
						</div>
					</div>

					<div className="rounded-xl border bg-card p-5 shadow-sm">
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-medium text-muted-foreground">
								Pending Requests
							</p>
							<div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
								<ClipboardCheck className="size-5" />
							</div>
						</div>
						<p className="mt-4 text-3xl font-bold tracking-tight">
							{summary.pendingAccessRequestCount}
						</p>
						<Link
							href="/admin/access-requests"
							className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
							Review requests <ArrowRight className="size-3.5" />
						</Link>
					</div>
				</div>
			</section>

			{/* Fundraiser overview */}
			<section className="space-y-4">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="text-lg font-semibold tracking-tight">
							Fundraiser Overview
						</h2>
						<p className="text-sm text-muted-foreground">
							Track progress through your fundraiser workflow.
						</p>
					</div>

					<Link
						href="/admin/fundraisers"
						className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
						View all fundraisers
						<ArrowRight className="size-4" />
					</Link>
				</div>

				<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
					<div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="font-semibold">All fundraisers</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								{summary.totalFundraiserCount} total
							</p>
						</div>

						<div className="w-full sm:max-w-48">
							<div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
								<span>Published</span>
								<span>{publishedPercentage}%</span>
							</div>
							<div
								role="progressbar"
								aria-label="Published fundraisers"
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={publishedPercentage}
								className="h-2 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-emerald-500 transition-all"
									style={{ width: `${publishedPercentage}%` }}
								/>
							</div>
						</div>
					</div>

					{fundraisers.length === 0 ? (
						<div className="flex flex-col items-center px-6 py-12 text-center">
							<div className="rounded-full bg-muted p-3">
								<FilePlus2 className="size-6 text-muted-foreground" />
							</div>
							<h3 className="mt-4 font-semibold">No fundraisers yet</h3>
							<p className="mt-1 max-w-sm text-sm text-muted-foreground">
								Create your first fundraiser to start tracking contributions and
								player allocations.
							</p>
							<div className="mt-4">
								<AddFundraiserDialog />
							</div>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b bg-muted/40 text-left text-muted-foreground">
										<th className="px-5 py-3 font-medium">Fundraiser</th>
										<th className="px-5 py-3 font-medium">Status</th>
										<th className="px-5 py-3 text-right font-medium">Action</th>
									</tr>
								</thead>
								<tbody>
									{fundraisers.map((fundraiser) => (
										<tr
											key={fundraiser.id}
											className="border-b last:border-0 transition-colors hover:bg-muted/30">
											<td className="px-5 py-4">
												<p className="font-medium">{fundraiser.name}</p>
											</td>
											<td className="px-5 py-4">
												<StatusBadge status={fundraiser.status} />
											</td>
											<td className="px-5 py-4 text-right">
												<Link
													href={`/admin/fundraisers/${fundraiser.id}`}
													className="inline-flex items-center gap-1 font-medium hover:underline">
													Manage
													<ArrowRight className="size-3.5" />
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</section>

			{/* Quick actions */}
			<section className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">
						Quick Actions
					</h2>
					<p className="text-sm text-muted-foreground">
						Common tasks for running your club.
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					<div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2 text-primary">
								<FilePlus2 className="size-5" />
							</div>
							<h3 className="font-semibold">Create Fundraiser</h3>
						</div>
						<p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
							Set up a fundraiser and prepare its participants.
						</p>
						<div className="mt-4">
							<AddFundraiserDialog />
						</div>
					</div>

					<div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
								<Users className="size-5" />
							</div>
							<h3 className="font-semibold">Manage Teams</h3>
						</div>
						<p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
							Manage teams, organize rosters, and add a new team.
						</p>
						<div className="mt-4 flex flex-wrap items-center gap-3">
							<AddTeamDialog />
							<Link
								href="/admin/teams"
								className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
								View teams <ArrowRight className="size-3.5" />
							</Link>
						</div>
					</div>

					<div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
								<ClipboardCheck className="size-5" />
							</div>
							<h3 className="font-semibold">Access Requests</h3>
						</div>
						<p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
							Approve or reject parent requests to access player profiles.
						</p>
						<div className="mt-4 flex flex-wrap items-center gap-3">
							<Link
								href="/admin/access-requests"
								className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
								Review requests <ArrowRight className="size-3.5" />
							</Link>
							{summary.pendingAccessRequestCount > 0 && (
								<span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
									{summary.pendingAccessRequestCount} pending
								</span>
							)}
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
