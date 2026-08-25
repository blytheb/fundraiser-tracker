import React from "react";
import { Button } from "@/components/ui/button";

import {
	ArrowLeft,
	CalendarDays,
	ChevronRight,
	Plus,
	Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Player } from "@/types/player";
import Link from "next/link";

type TabProps = {
	players: Player[];
};

export default function RosterTabContent({ players }: TabProps) {
	return (
		<>
			<div className="mb-3 flex items-center justify-between">
				<div>
					<h2 className="font-semibold">Roster</h2>

					<p className="text-sm text-muted-foreground">
						{players.length} players
					</p>
				</div>

				<Button size="sm">
					<Plus className="mr-1.5 h-4 w-4" />
					Add Player
				</Button>
			</div>

			<Card>
				<CardContent className="p-0">
					<div className="divide-y">
						{players.map((player) => (
							<Link
								key={player.id}
								href={`/players/${player.id}`}
								className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50">
								<div className="flex min-w-0 items-center gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
										{player.firstName[0]}
										{player.lastName[0]}
									</div>

									<div className="min-w-0">
										<p className="truncate text-sm font-medium">
											{player.firstName} {player.lastName}
										</p>

										<p className="text-xs text-muted-foreground">
											{player.jerseyNumber
												? `#${player.jerseyNumber}`
												: "No number"}

											{player.position && ` • ${player.position}`}
										</p>
									</div>
								</div>

								<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
							</Link>
						))}
					</div>
				</CardContent>
			</Card>
		</>
	);
}
