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
		<Tabs defaultValue="roster" className="w-full">
			<TabsList className="grid h-10 w-full grid-cols-2">
				<TabsTrigger value="roster">Roster</TabsTrigger>
				<TabsTrigger value="fundraisers">Fundraisers</TabsTrigger>
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
