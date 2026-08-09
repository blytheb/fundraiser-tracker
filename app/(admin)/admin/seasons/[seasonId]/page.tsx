import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function SeasonPage({
	params,
}: {
	params: Promise<{ seasonId: string }>;
}) {
	const { seasonId } = await params;

	const season = await prisma.season.findUnique({
		where: {
			id: seasonId,
		},
		include: {
			players: true,
			fundraisers: true,
		},
	});

	if (!season) {
		notFound();
	}

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">{season.name}</h1>

				<p className="text-muted-foreground">
					{season.startDate ? season.startDate.getFullYear() : "No start date"}{" "}
					· {season.status}
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<div className="rounded-lg border p-6">
					<h2 className="font-semibold">Players</h2>
					<p className="mt-2 text-2xl font-bold">{season.players.length}</p>
				</div>

				<div className="rounded-lg border p-6">
					<h2 className="font-semibold">Fundraisers</h2>
					<p className="mt-2 text-2xl font-bold">{season.fundraisers.length}</p>
				</div>

				<div className="rounded-lg border p-6">
					<h2 className="font-semibold">Fundraiser Total</h2>
					<p className="mt-2 text-2xl font-bold">$0.00</p>
				</div>
			</div>
		</div>
	);
}
