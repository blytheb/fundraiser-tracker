import React from "react";
import PlayerHeader from "@/features/players/PlayerHeader";

import { getPlayerById } from "@/features/players/data/players";
import { getPlayerTeams } from "@/features/players/data/playerTeams";

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

	if (!player) {
		return <div>Player Not Found</div>;
	}

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
			<PlayerHeader player={player} teams={teams} />
		</main>
	);
}
