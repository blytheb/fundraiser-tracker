import React from "react";

import ManageFundraiserParticipantsDialog from "@/components/forms/fundraisers/ManageFundraiserParticipantsDialog";

import { UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Fundraiser, Player } from "@prisma/client";

type CardProps = {
	fundraiserId: string;
	selectedPlayers: Player[];
	eligiblePlayers: Player[];
};

export default function FundraiserParticipants({
	fundraiserId,
	selectedPlayers,
	eligiblePlayers,
}: CardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="flex items-center gap-2">
						<UsersRound className="h-5 w-5" />
						Participants
					</CardTitle>

					<p className="text-sm text-muted-foreground">
						{selectedPlayers.length} players participating
					</p>
				</div>

				<ManageFundraiserParticipantsDialog
					fundraiserId={fundraiserId}
					selectedPlayers={selectedPlayers}
					eligiblePlayers={eligiblePlayers}
				/>
			</CardHeader>

			<CardContent>
				{selectedPlayers.length === 0 ? (
					<div className="rounded-lg border border-dashed p-8 text-center">
						<p className="text-sm font-medium">No participants added</p>

						<p className="mt-1 text-sm text-muted-foreground">
							Add players who are participating in this fundraiser.
						</p>
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						{selectedPlayers.map((player) => (
							<div key={player.id} className="rounded-lg border p-4">
								<p className="font-medium">
									{player.firstName} {player.lastName}
								</p>

								<p className="text-xs text-muted-foreground">Participant</p>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
