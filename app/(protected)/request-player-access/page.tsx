import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authorization";
import { PlayerAccessRequestForm } from "@/features/player-access/components/PlayerAccessRequestForm";

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
				Submit a request to connect a player to your parent account. An
				administrator must approve your request.
			</p>

			<PlayerAccessRequestForm players={players} />
		</main>
	);
}
