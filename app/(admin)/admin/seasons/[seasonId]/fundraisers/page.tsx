import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NewFundraiserDialog from "@/components/admin/new-fundraiser-dialog";

export default async function FundraiserPage({
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
			fundraisers: true,
		},
	});

	if (!season) {
		notFound();
	}

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Fundraisers</h1>
				<p className="text-muted-foreground">Fundraisers for {season.name}</p>
			</div>
			<NewFundraiserDialog seasonId={seasonId} />
			{season.fundraisers.length === 0 ? (
				<div className="rounded-lg border p-6 text-center text-muted-foreground">
					No fundraisers have been created for this season yet.
				</div>
			) : (
				<div>
					{season.fundraisers.map((fundraiser) => (
						<div key={fundraiser.id} className="rounded-lg border p-4">
							<h2 className="font-medium">{fundraiser.name}</h2>
							{fundraiser.description && (
								<p className="mt-1 text-sm text-muted-foreground">
									{fundraiser.description}
								</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
