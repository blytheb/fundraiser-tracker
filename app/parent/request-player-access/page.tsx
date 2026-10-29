import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { PlayerAccessRequestForm } from "@/components/forms/player-access/PlayerAccessRequestForm";
import Link from "next/link";
import { getMyAccessRequests } from "@/features/player-access/data/get-my-access-requests";
import { AccessRequestStatus } from "@/features/player-access/AccessRequestStatus";
import { CancelPlayerAccessRequestButton } from "@/components/forms/player-access/CancelPlayerAccessRequestButton";

export default async function RequestPlayerAccessPage() {
	const user = await requireUser();

	if (user.role !== "PARENT") {
		return (
			<main className="p-8">
				Only parent accounts can request player access.
			</main>
		);
	}

	const players = await prisma.player.findMany({
		where: { status: true },
		select: {
			id: true,
			firstName: true,
			lastName: true,
		},
		orderBy: { lastName: "asc" },
	});
	const requests = await getMyAccessRequests();
	const existingLinks = await prisma.parentPlayerLink.findMany({
		where: {
			userId: user.id,
		},
		select: {
			playerId: true,
		},
	});

	return (
		<main className="mx-auto max-w-3xl p-6">
			<h1 className="text-2xl font-bold">Request Player Access</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				{players.length === 0
					? "There are no active players available right now. Please contact an administrator for assistance."
					: "Select a player to request access to their fundraiser information. An administrator must approve your request."}
			</p>

			<PlayerAccessRequestForm
				players={players}
				requests={requests.map((request) => ({
					playerId: request.playerId,
					status: request.status,
				}))}
				linkedPlayerIds={existingLinks.map((link) => link.playerId)}
			/>

			{requests.length === 0 ? (
				<div className="mt-6 rounded-xl border p-6">
					<h2 className="font-semibold">No requests yet</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Submit a request to connect a player to your account.
					</p>
					<Link
						href="/parent/request-player-access"
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
									{/* {request.status === "APPROVED" && (
										<Link
											href="/parent/my-players"
											className="text-sm font-medium underline underline-offset-4">
											View my players
										</Link>
									)}
									{request.status === "REJECTED" && (
										<Link
											href="/parent/request-player-access"
											className="text-sm font-medium underline underline-offset-4">
											Request access again
										</Link>
									)} */}
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</main>
	);
}
