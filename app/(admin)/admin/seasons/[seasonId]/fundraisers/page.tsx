import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NewFundraiserDialog from "@/components/admin/new-fundraiser-dialog";
import Link from "next/link";
export default async function FundraiserListPage({
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
						<div
							key={fundraiser.id}
							className="flex items-center justify-center rounded-lg border p-4 gap-6">
							<div className="space-y-1">
								<Link
									href={`/admin/seasons/${seasonId}/fundraisers/${fundraiser.id}`}
									className="font-medium hover:underline">
									{fundraiser.name}
								</Link>
								<p className="text-sm text-muted-foreground">
									{fundraiser.fundraiserDate.toLocaleDateString()}
								</p>
							</div>
							<div className="flex items-center gap-6">
								<div>
									<p className="text-sm text-muted-foreground">Status</p>
									<p className="font-medium">{fundraiser.status}</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground">Distribution</p>
									<p className="font-medium">{fundraiser.distributionMethod}</p>
								</div>

								<div>
									<p className="text-xs text-muted-foreground">Raised</p>
									<p className="font-medium">$0.00</p>
								</div>
							</div>
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
