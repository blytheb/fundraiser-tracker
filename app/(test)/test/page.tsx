import React from "react";
import { TeamList } from "@/components/teams/TeamList";
// import { PlayerList } from "@/components/players/PlayerList";
import { FundraiserList } from "@/components/fundraisers/FundraiserList";

export default function test() {
	return (
		<div>
			<TeamList />
			{/* <PlayerList /> */}
			<FundraiserList />
		</div>
	);
}
