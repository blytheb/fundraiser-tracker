"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { requestPlayerAccess } from "@/features/player-access/actions/request-player-access";

import { AccessRequestStatus as AccessRequestStatusType } from "@prisma/client";
type PlayerOption = {
	id: string;
	firstName: string;
	lastName: string;
};
type AccessRequest = {
	playerId: string;
	status: AccessRequestStatusType;
};

export function PlayerAccessRequestForm({
	players,
	requests,
	linkedPlayerIds,
}: {
	players: PlayerOption[];
	requests: AccessRequest[];
	linkedPlayerIds: string[];
}) {
	const router = useRouter();
	const pendingPlayerIds = new Set(
		requests
			.filter((request) => request.status === "PENDING")
			.map((request) => request.playerId),
	);
	const linkedPlayerIdSet = new Set(linkedPlayerIds);
	const hasAvailablePlayer = players.some(
		(player) =>
			!pendingPlayerIds.has(player.id) && !linkedPlayerIdSet.has(player.id),
	);
	const [playerId, setPlayerId] = useState(
		players.find(
			(player) =>
				!pendingPlayerIds.has(player.id) && !linkedPlayerIdSet.has(player.id),
		)?.id ?? "",
	);
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
					router.refresh();
				}
			} catch (error) {
				setMessage(error instanceof Error ? error.message : "Request failed.");
				setIsError(true);
			}
		});
	}

	return (
		<div className="mt-6 space-y-4">
			{players.length === 0 && (
				<p className="rounded-md border p-4 text-md text-muted-foreground">
					There are currently no active players available to request. Please
					contact an administrator for assistance.
				</p>
			)}
			{!hasAvailablePlayer && players.length > 0 ? (
				<p className="text-md text-muted-foreground">
					You already have access to or pending requests for all active players.
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
							disabled={isPending || !hasAvailablePlayer}>
							{players.map((player) => {
								const hasPendingRequest = pendingPlayerIds.has(player.id);
								const alreadyLinked = linkedPlayerIdSet.has(player.id);

								return (
									<option
										key={player.id}
										value={player.id}
										disabled={hasPendingRequest || alreadyLinked}>
										{player.firstName} {player.lastName}
										{alreadyLinked
											? " — Access granted"
											: hasPendingRequest
												? " — Request pending"
												: ""}
									</option>
								);
							})}
						</select>
					</label>

					<button
						type="button"
						onClick={handleSubmit}
						disabled={
							isPending ||
							!playerId ||
							!hasAvailablePlayer ||
							pendingPlayerIds.has(playerId) ||
							linkedPlayerIdSet.has(playerId)
						}
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
