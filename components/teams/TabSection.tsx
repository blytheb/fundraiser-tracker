import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RosterTabContent from "@/components/teams/RosterTabContent";
import FundraiserTabContent from "@/components/teams/FundraiserTabContent";
import type { Team } from "@/types/team";

type TabProps = {
	team: Team;
};

export default function TabSection({ team }: TabProps) {
	return (
		<Tabs defaultValue="roster" className="flex flex-col w-full">
			<TabsList className="flex w-full flex-row">
				<TabsTrigger value="roster">Roster</TabsTrigger>

				<TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>

				{/* <TabsTrigger value="trips">{`Trips (${team.trips.length})`}</TabsTrigger> */}
			</TabsList>
			<TabsContent value="roster" className="mt-4">
				<RosterTabContent players={team.players} />
			</TabsContent>
			<TabsContent value="fundraisers" className="mt-4">
				<FundraiserTabContent fundraisers={team.fundraisers} />
			</TabsContent>
		</Tabs>
	);
}
