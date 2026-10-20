"use client";

import { useState, useTransition } from "react";
import { requestPlayerAccess } from "@/features/player-access/actions/request-player-access";

type PlayerOption = {
	id: string;
	firstName: string;
	lastName: string;
};

export function RequestPlayerAccessTestForm({
	players,
}: {
	players: PlayerOption[];
}) {
	const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
	const [message, setMessage] = useState("");
	const [isPending, startTransition] = useTransition();

	function handleSubmit() {
		setMessage("");

		if (!playerId) {
			setMessage("No active player is available.");
			return;
		}

		startTransition(async () => {
			try {
				await requestPlayerAccess(playerId);
				setMessage("Access request submitted successfully.");
			} catch (error) {
				setMessage(error instanceof Error ? error.message : "Request failed.");
			}
		});
	}

	return (
		<div className="mt-6 space-y-4">
			<label className="block">
				<span className="mb-2 block text-sm font-medium">Select player</span>
				<select
					className="w-full rounded-md border p-2"
					value={playerId}
					onChange={(event) => setPlayerId(event.target.value)}
					disabled={isPending || players.length === 0}>
					{players.map((player) => (
						<option key={player.id} value={player.id}>
							{player.firstName} {player.lastName}
						</option>
					))}
				</select>
			</label>

			<button
				type="button"
				onClick={handleSubmit}
				disabled={isPending || players.length === 0}
				className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
				{isPending ? "Submitting..." : "Request Access"}
			</button>

			{message && <p role="status">{message}</p>}
		</div>
	);
}
