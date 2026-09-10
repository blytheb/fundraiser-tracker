import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import RosterTabContent from "@/features/teams/RosterTabContent";
import FundraiserTabContent from "@/features/teams/FundraiserTabContent";

import type { Player, Fundraiser } from "@prisma/client";

type TabProps = {
	teamId: string;
	players: Player[];
	availablePlayers: Player[];
	fundraisers: Fundraiser[];
	availableFundraisers: Fundraiser[];
};

export default function TabSection({
	teamId,
	players,
	availablePlayers,
	fundraisers,
	availableFundraisers,
}: TabProps) {
	return (
		<Tabs defaultValue="roster" className="flex flex-col w-full">
			<TabsList className="flex w-full flex-row">
				<TabsTrigger value="roster">Roster</TabsTrigger>

				<TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>

				{/* <TabsTrigger value="trips">{`Trips (${team.trips.length})`}</TabsTrigger> */}
			</TabsList>
			<TabsContent value="roster" className="mt-4">
				<RosterTabContent
					teamId={teamId}
					players={players}
					availablePlayers={availablePlayers}
				/>
			</TabsContent>
			<TabsContent value="fundraisers" className="mt-4">
				<FundraiserTabContent
					teamId={teamId}
					fundraisers={fundraisers}
					availableFundraisers={availableFundraisers}
				/>
			</TabsContent>
		</Tabs>
	);
}
