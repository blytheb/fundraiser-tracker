import React from "react";
import { Button } from "@/components/ui/button";
import { Plus} from "lucide-react";

import PlayerTable from "@/components/players/PlayerTable";


export function PlayerList() {
	return (
		<>
			<div className="p-6">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Players</h1>
						<p className="text-muted-foreground">All Menehune players</p>
					</div>

					<Button>
						<Plus/>
						Add Player
					</Button>
				</div>

				{/* <div className="rounded-lg border">
					<div className="p-6 text-center text-muted-foreground">
						No players have been created yet.
					</div>
				</div> */}

				<PlayerTable />
		
			</div>
		</>
	);
}
