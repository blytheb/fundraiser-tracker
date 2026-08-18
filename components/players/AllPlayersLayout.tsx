"use client";

import { useState } from "react";
import AddPlayerDialog from "@/components/players/forms/AddPlayerDialog";
import PlayerTable from "@/components/players/PlayerTable";

import type { Player } from "@/types/players";

type LayoutProps = {
	players: Player[];
};

export default function AllPlayersLayout({ players }: LayoutProps) {
	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Players</h1>
					<p className="text-muted-foreground">All Menehune players</p>
				</div>
				<AddPlayerDialog />
			</div>
			<PlayerTable players={players} />
		</div>
	);
}
