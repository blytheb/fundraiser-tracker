import React from "react";
import { mockFundraisers } from "@/lib/mock-data/fundraisers";

type TestPageProps = {
	params: Promise<{
		fundraiserId: string;
	}>;
};

export default async function FundraiserPage({ params }: TestPageProps) {
	const { fundraiserId } = await params;

  const fundraiser = mockFundraisers.find((fundraiser) => fundraiser.id === fundraiserId)

  if (!fundraiser) {
    return <div>Fundraiser Not Found</div>
  }

	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Teams</h1>
					<p className="text-muted-foreground">All Menehune teams</p>
				</div>
			</div>

			<div className="rounded-lg border">
				<div className="p-6 text-center text-muted-foreground">
					No seasons have been created yet.
				</div>
			</div>
			<h1>Fundraiser: {fundraiserId}</h1>
			<p>{fundraiser.name}</p>
			<p>{fundraiser.description}</p>
			<p>{fundraiser.notes}</p>
			<p>{fundraiser.startDate.toLocaleDateString()}</p>
			<p>{fundraiser.status}</p>
			<p>{fundraiser.distributionMethod}</p>
			<p>{fundraiser.collectionType}</p>
			<p>{fundraiser.scope}</p>
		</div>
	);
}