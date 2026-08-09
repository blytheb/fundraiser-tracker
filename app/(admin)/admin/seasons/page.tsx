import React from "react";
import { prisma } from "@/lib/prisma";
import NewSeasonDialog from "@/components/admin/new-season-dialog";

export default async function Seasonspage() {
	const seasons = await prisma.season.findMany({
		orderBy: {
			startDate: "desc",
		},
	});

	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Seasons</h1>
					<p className="text-muted-foreground">
						Manage your fundraiser seasons.
					</p>
				</div>
				<NewSeasonDialog />
			</div>

			<div className="rounded-lg border">
				{seasons.length === 0 ? (
					<div className="p-6 text-center text-muted-foreground">
						No seasons have been created yet.
					</div>
				) : (
					<div className="divide-y">
						{seasons.map((season) => (
							<div
								key={season.id}
								className="flex items-center justify-between p-4">
								<div>
									<h2 className="font-medium">{season.name}</h2>
									<p className="text-sm text-muted-foreground">
										{seasons.startDate
											? `${season.startDate.getFullYear()} · ${season.status}`
											: `No start date · ${season.status}`}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
