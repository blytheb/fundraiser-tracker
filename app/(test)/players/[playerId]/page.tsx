import React from "react";
import { mockPlayers } from "@/lib/mock-data/players";

type PlayerPageProps = {
	params: Promise<{
		playerId: string;
	}>;
};

export default async function PlayerPage({ params }: PlayerPageProps) {
	const { playerId } = await params;

	const player = mockPlayers.find(
		(player) => player.id === playerId,
	);

	if (!player) {
		return <div>Player Not Found</div>;
	}

	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">
						{player.firstName} {player.lastName}
					</h1>
					<p className="text-muted-foreground">All Menehune teams</p>
				</div>
			</div>

			<div className="rounded-lg border">
				<div className="p-6 text-center text-muted-foreground">
					No seasons have been created yet.
				</div>
			</div>
		</div>
	);
}
