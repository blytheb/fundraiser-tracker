import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import RosterTabContent from "@/features/teams/RosterTabContent";
// import FundraiserTabContent from "@/features/teams/FundraiserTabContent";

import type { Player } from "@prisma/client";

type TabProps = {
	players: Player[];
};

export default function TabSection({ players }: TabProps) {
	return (
		<Tabs defaultValue="roster" className="flex flex-col w-full">
			<TabsList className="flex w-full flex-row">
				<TabsTrigger value="roster">Roster</TabsTrigger>

				<TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>

				{/* <TabsTrigger value="trips">{`Trips (${team.trips.length})`}</TabsTrigger> */}
			</TabsList>
			<TabsContent value="roster" className="mt-4">
				<RosterTabContent players={players} />
			</TabsContent>
			<TabsContent value="fundraisers" className="mt-4">
				Fundraiser Content
				{/* <FundraiserTabContent fundraisers={team.fundraisers} /> */}
			</TabsContent>
		</Tabs>
	);
}
