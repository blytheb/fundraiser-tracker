import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Plus } from "lucide-react";

import ListItemWithAvatar from "@/components/ui-reusable/ListItemWithAvatar";
import AddPlayerToTeamDialog from "@/components/forms/teams/AddPlayerToTeamDialog";
import TeamPlayerActions from "@/features/teams/TeamPlayerActions";

import type { Player } from "@prisma/client";

type TabProps = {
	teamId: string;
	players: Player[];
	avaiablePlayers: Player[];
};

export default function RosterTabContent({
	teamId,
	players,
	availablePlayers,
}: TabProps) {
	return (
		<>
			<div className="mb-3 flex items-center justify-between">
				<div>
					<h2 className="font-semibold">Roster</h2>

					<p className="text-sm text-muted-foreground">
						{players.length} players
					</p>
				</div>

				<AddPlayerToTeamDialog
					teamId={teamId}
					availablePlayers={availablePlayers}
				/>
			</div>

			<Card>
				<CardContent className="p-0">
					<div className="divide-y">
						{players.map((player) => (
							<ListItemWithAvatar
								key={player.id}
								player={player}
								actions={<TeamPlayerActions player={player} teamId={teamId} />}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);
}
