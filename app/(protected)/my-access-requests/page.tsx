import Link from "next/link";
import { getMyAccessRequests } from "@/features/player-access/data/get-my-access-requests";
import { AccessRequestStatus } from "@/features/player-access/AccessRequestStatus";
import { CancelPlayerAccessRequestButton } from "@/components/forms/player-access/CancelPlayerAccessRequestButton";

export default async function MyAccessRequestsPage() {
	const requests = await getMyAccessRequests();

	return (
		<main className="mx-auto max-w-3xl p-6">
			<h1 className="text-2xl font-bold">My Access Requests</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Track the status of your player access requests.
			</p>

			{requests.length === 0 ? (
				<div className="mt-6 rounded-xl border p-6">
					<h2 className="font-semibold">No requests yet</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Submit a request to connect a player to your account.
					</p>
					<Link
						href="/request-player-access"
						className="mt-4 inline-block underline underline-offset-4">
						Request player access
					</Link>
				</div>
			) : (
				<div className="mt-6 space-y-3">
					{requests.map((request) => (
						<article key={request.id} className="rounded-xl border p-4">
							<div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
								<div>
									<h2 className="font-semibold">
										{request.player.firstName} {request.player.lastName}
									</h2>
									<p className="text-sm text-muted-foreground">
										Submitted {request.createdAt.toLocaleDateString()}
									</p>
								</div>

								<div className="flex flex-col items-start gap-2 sm:items-end">
									<AccessRequestStatus status={request.status} />
									{request.status === "PENDING" && (
										<CancelPlayerAccessRequestButton requestId={request.id} />
									)}
									{request.status === "APPROVED" && (
										<Link
											href="/my-players"
											className="text-sm font-medium underline underline-offset-4">
											View my players
										</Link>
									)}
									{request.status === "REJECTED" && (
										<Link
											href="/request-player-access"
											className="text-sm font-medium underline underline-offset-4">
											Request access again
										</Link>
									)}
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</main>
	);
}
