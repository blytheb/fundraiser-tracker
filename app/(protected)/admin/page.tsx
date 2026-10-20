import { requireAdmin } from "@/lib/authorization";
import ReviewPlayerAccessButtons from "@/features/player-access/components/ReviewPlayerAccessButtons";
import { getPendingPlayerAccessRequests } from "@/features/player-access/data/get-pending-player-access-requests";

export default async function AdminPage() {
	await requireAdmin();

	const requests = await getPendingPlayerAccessRequests();

	return (
		<main className="mx-auto max-w-5xl p-6">
			<h1 className="text-2xl font-bold">Player Access Requests</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Review parent requests to access player profiles.
			</p>

			{requests.length === 0 ? (
				<p className="mt-6 rounded-lg border p-4">
					{" "}
					There are no pending access requests.
				</p>
			) : (
				<div className="mt-6 space-y-6">
					{requests.map((request) => (
						<div className="rounded-lg border p-4" key={request.id}>
							<p className="font-medium">
								{request.user.name || "Unnamed parent"}
							</p>

							<p className="text-sm text-muted-foreground">
								{request.user.email}
							</p>
							<p className="mt-3">
								<strong>Requested player:</strong>
								{request.player.firstName} {request.player.lastName}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Submitted {request.createdAt.toLocaleDateString()}
							</p>

							<ReviewPlayerAccessButtons requestId={request.id} />
						</div>
					))}
				</div>
			)}
		</main>
	);
}
