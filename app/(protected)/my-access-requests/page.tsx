import Link from "next/link";
import { getMyAccessRequests } from "@/features/player-access/data/get-my-access-requests";

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

								<span className="text-sm font-medium">
									{request.status === "PENDING"
										? "Pending review"
										: request.status === "APPROVED"
											? "Approved"
											: "Rejected"}
								</span>
							</div>
						</article>
					))}
				</div>
			)}
		</main>
	);
}
