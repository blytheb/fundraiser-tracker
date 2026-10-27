"use client";

import { useState, useTransition } from "react";
import { requestPlayerAccess } from "@/features/player-access/actions/request-player-access";

type PlayerOption = {
	id: string;
	firstName: string;
	lastName: string;
};

export function PlayerAccessRequestForm({
	players,
}: {
	players: PlayerOption[];
}) {
	const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
	const [message, setMessage] = useState("");
	const [isError, setIsError] = useState(false);
	const [isPending, startTransition] = useTransition();

	function handleSubmit() {
		setMessage("");
		setIsError(false);

		if (!playerId) {
			setMessage("No active player is available.");
			setIsError(true);
			return;
		}

		startTransition(async () => {
			try {
				const result = await requestPlayerAccess(playerId);
				if (result.success) {
					setMessage("Access request submitted successfully.");
				}
			} catch (error) {
				setMessage(error instanceof Error ? error.message : "Request failed.");
				setIsError(true);
			}
		});
	}

	return (
		<div className="mt-6 space-y-4">
			{players.length === 0 ? (
				<p className="rounded-md border p-4 text-sm text-muted-foreground">
					There are currently no active players available to request. Please
					contact an administrator for assistance.
				</p>
			) : (
				<>
					<label className="block">
						<span className="mb-2 block text-sm font-medium">
							Select player
						</span>
						<select
							className="w-full rounded-md border p-2"
							value={playerId}
							onChange={(event) => {
								setPlayerId(event.target.value);
								setMessage("");
								setIsError(false);
							}}
							disabled={isPending}>
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
						disabled={isPending}
						className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
						{isPending ? "Submitting..." : "Request Access"}
					</button>
				</>
			)}
			{message && (
				<p
					role={isError ? "alert" : "status"}
					className={
						isError ? "text-sm text-destructive" : "text-sm text-green-600"
					}>
					{message}
				</p>
			)}
		</div>
	);
}
