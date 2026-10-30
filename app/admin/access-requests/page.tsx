import { requireAdmin } from "@/lib/permissions";
import ReviewPlayerAccessButtons from "@/components/forms/player-access/ReviewPlayerAccessButtons";
import { getPendingPlayerAccessRequests } from "@/features/player-access/data/get-pending-player-access-requests";
import { ArrowLeft, CheckCircle2, Clock3, Users } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
	await requireAdmin();

	const requests = await getPendingPlayerAccessRequests();

	return (
		<main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
			<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<Link
						href="/admin"
						className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
						<ArrowLeft className="size-4" />
						Back to dashboard
					</Link>

					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						Menehune Basketball
					</p>
					<h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
						Player Access Requests
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Review parent requests and manage access to player profiles.
					</p>
				</div>

				<div className="flex items-center gap-3 rounded-xl border p-4">
					<div className="flex size-11 items-center justify-center rounded-lg bg-muted">
						<Users className="size-5 text-muted-foreground" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Awaiting review</p>
						<p className="text-2xl font-bold tabular-nums">{requests.length}</p>
					</div>
				</div>
			</header>

			<section className="space-y-4">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h2 className="text-lg font-semibold">Pending Requests</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Confirm the parent and player before reviewing each request.
						</p>
					</div>
					<span className="rounded-full border px-3 py-1 text-sm font-medium tabular-nums">
						{requests.length} pending
					</span>
				</div>

				{requests.length === 0 ? (
					<div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center">
						<div className="flex size-14 items-center justify-center rounded-full bg-muted">
							<CheckCircle2 className="size-7 text-muted-foreground" />
						</div>
						<h3 className="mt-4 font-semibold">You’re all caught up</h3>
						<p className="mt-2 max-w-md text-sm text-muted-foreground">
							There are no pending player access requests. New requests will
							appear here when parents ask to access player profiles.
						</p>
						<Link
							href="/admin"
							className="mt-5 text-sm font-medium underline underline-offset-4">
							Return to dashboard
						</Link>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{requests.map((request) => (
							<article
								className="flex flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm"
								key={request.id}>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
											Parent
										</p>
										<h3 className="mt-1 break-words font-semibold">
											{request.user.name || "Unnamed parent"}
										</h3>
										<p className="mt-1 break-all text-sm text-muted-foreground">
											{request.user.email}
										</p>
									</div>

									<span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
										<Clock3 className="size-3.5" />
										Pending
									</span>
								</div>

								<div className="mt-5 flex-1 rounded-lg bg-muted/50 p-4">
									<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Player requested
									</p>
									<p className="mt-2 font-semibold">
										{request.player.firstName} {request.player.lastName}
									</p>
								</div>

								<p className="mt-4 text-xs text-muted-foreground">
									Submitted{" "}
									{request.createdAt.toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</p>

								<div className="mt-4 border-t pt-4">
									<ReviewPlayerAccessButtons requestId={request.id} />
								</div>
							</article>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
