import React from "react";
import PlayerHeader from "@/features/players/PlayerHeader";
import SummaryBlock from "@/components/ui-reusable/SummaryBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPlayerById } from "@/features/players/data/players";
import { getPlayerTeams } from "@/features/players/data/playerTeams";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FundraiserList from "@/features/fundraisers/FundraiserList";
import { getFundraisers } from "@/features/fundraisers/data/fundraisers";
import { ItemGroup } from "@/components/ui/item";
import ListItemWithIcon from "@/components/ui-reusable/ListItemWithIcon";

type PlayerPageProps = {
	params: Promise<{
		playerId: string;
	}>;
};

export default async function PlayerPage({ params }: PlayerPageProps) {
	const { playerId } = await params;
	const [player, teams] = await Promise.all([
		getPlayerById(playerId),
		getPlayerTeams(playerId),
	]);
	const fundraisers = await getFundraisers();

	if (!player) {
		return <div>Player Not Found</div>;
	}

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
			<PlayerHeader player={player} teams={teams} />
			<div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
				<SummaryBlock title="Total" value={0} label="Total" />
				<SummaryBlock title="Deposits" value={0} label="Active" />
				<SummaryBlock title="Expenses" value={0} label="Active" />
			</div>
			<div className="space-y-2">
				{fundraisers.length === 0 ? (
					<div className="flex flex-col w-full items-center gap-3 rounded-lg border p-3">
						No Fundraisers Found
					</div>
				) : (
					<div className="space-y-4">
						<ItemGroup>
							{fundraisers.map((fundraiser) => (
								<ListItemWithIcon key={fundraiser.id} fundraiser={fundraiser} />
							))}
						</ItemGroup>
					</div>
				)}
			</div>
		</main>
	);
}
