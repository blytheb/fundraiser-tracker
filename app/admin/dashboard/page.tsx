import { requireAdmin } from "@/lib/permissions";
import ReviewPlayerAccessButtons from "@/components/forms/player-access/ReviewPlayerAccessButtons";
import { getPendingPlayerAccessRequests } from "@/features/player-access/data/get-pending-player-access-requests";

export default async function AdminPage() {
	await requireAdmin();

	const requests = await getPendingPlayerAccessRequests();

	return (
		<main className="mx-auto max-w-5xl p-6">
			<header>
				<h1 className="text-2xl font-bold">Player Access Requests</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Review parent requests to access player profiles.
				</p>
			</header>

			<section className="mt-8">
				<div className="flex items-center justify-between gap-4">
					<h2 className="text-lg font-semibold">Pending Requests</h2>
					<span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
						{requests.length}
					</span>
				</div>

				{requests.length === 0 ? (
					<div className="mt-4 rounded-lg border p-8 text-center">
						<h3 className="font-medium">All caught up!</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							There are no pending player access requests to review.
						</p>
					</div>
				) : (
					<div className="mt-4 space-y-4">
						{requests.map((request) => (
							<article className="rounded-xl border p-5" key={request.id}>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
											Parent
										</p>
										<h3 className="mt-1 font-semibold">
											{request.user.name || "Unnamed parent"}
										</h3>
										<p className="text-sm text-muted-foreground">
											{request.user.email}
										</p>
									</div>

									<span className="rounded-full border px-3 py-1 text-xs font-medium">
										Pending
									</span>
								</div>

								<div className="mt-5 rounded-lg bg-muted/50 p-4">
									<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
										Player requested
									</p>
									<p className="mt-1 font-medium">
										{request.player.firstName} {request.player.lastName}
									</p>
								</div>

								<p className="mt-4 text-xs text-muted-foreground">
									Submitted {request.createdAt.toLocaleDateString()}
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
