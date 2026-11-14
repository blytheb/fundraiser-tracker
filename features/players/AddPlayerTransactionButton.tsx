"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import IndividualTransactionDialog from "@/components/forms/transactions/IndividualTransactionDialog";

type PlayerOption = { id: string; name: string };

// "Add transaction" on the player page: the individual transaction dialog
// with this player already chosen.
export default function AddPlayerTransactionButton({
	playerId,
	players,
}: {
	playerId: string;
	players: PlayerOption[];
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
				<Plus />
				Add transaction
			</Button>
			<IndividualTransactionDialog
				open={open}
				onOpenChange={setOpen}
				players={players}
				initialPlayerId={playerId}
			/>
		</>
	);
}
