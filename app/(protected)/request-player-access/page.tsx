import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authorization";
import { PlayerAccessRequestForm } from "@/components/forms/player-access/PlayerAccessRequestForm";
import Link from "next/link";

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

	return (
		<main className="mx-auto max-w-xl p-6">
			<h1 className="text-2xl font-bold">Request Player Access</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				{players.length === 0
					? "There are no active players available right now. Please contact an administrator for assistance."
					: "Select a player to request access to their fundraiser information. An administrator must approve your request."}
			</p>

			<PlayerAccessRequestForm players={players} />
			<div className="mt-4">
				<Link
					href="/my-access-requests"
					className="text-sm font-medium underline underline-offset-4">
					View my existing requests
				</Link>
			</div>
		</main>
	);
}
