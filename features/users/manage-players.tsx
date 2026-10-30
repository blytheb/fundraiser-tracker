"use client";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useState, useTransition } from "react";
import { assignPlayerToUser } from "@/features/users/actions/assign-player";
import { removePlayerFromUser } from "@/features/users/actions/remove-player";

type ManagePlayersProps = {
	userId: string;
	playerLinks: {
		id: string;
		player: {
			id: string;
			firstName: string;
			lastName: string;
			status: boolean;
		};
	}[];
	availablePlayers: {
		id: string;
		firstName: string;
		lastName: string;
	}[];
};

export function ManagePlayers({
	userId,
	playerLinks,
	availablePlayers,
}: ManagePlayersProps) {
	const [selectedPlayerId, setSelectedPlayerId] = useState("");
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState("");

	const linkedPlayerIds = playerLinks.map((link) => link.player.id);

	const unlinkedPlayers = availablePlayers.filter(
		(player) => !linkedPlayerIds.includes(player.id),
	);

	function handleAssign() {
		if (!selectedPlayerId) return;

		setError("");

		startTransition(async () => {
			try {
				await assignPlayerToUser(userId, selectedPlayerId);
				setSelectedPlayerId("");
			} catch (error) {
				setError(
					error instanceof Error ? error.message : "Unable to assign player.",
				);
			}
		});
	}

	function handleRemove(playerId: string) {
		setError("");

		startTransition(async () => {
			try {
				await removePlayerFromUser(userId, playerId);
			} catch (error) {
				setError(
					error instanceof Error ? error.message : "Unable to remove player.",
				);
			}
		});
	}

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button type="button" variant="outline" size="sm">
						<Settings2 className="mr-2 inline size-4" />
						Manage
					</Button>
				}></DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Manage Player Access</DialogTitle>
					<DialogDescription>
						Assign or remove players linked to this account.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-3">
					<div className="flex flex-col gap-2 sm:flex-row">
						<select
							value={selectedPlayerId}
							onChange={(event) => setSelectedPlayerId(event.target.value)}
							disabled={isPending || unlinkedPlayers.length === 0}
							className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm">
							<option value="">
								{unlinkedPlayers.length > 0
									? "Select a player"
									: "No available players"}
							</option>

							{unlinkedPlayers.map((player) => (
								<option key={player.id} value={player.id}>
									{player.firstName} {player.lastName}
								</option>
							))}
						</select>

						<button
							type="button"
							onClick={handleAssign}
							disabled={!selectedPlayerId || isPending}
							className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
							{isPending ? "Saving..." : "Assign Player"}
						</button>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}

					<div className="space-y-2">
						{playerLinks.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No players linked to this account.
							</p>
						) : (
							playerLinks.map((link) => (
								<div
									key={link.id}
									className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
									<div>
										<p className="text-sm font-medium">
											{link.player.firstName} {link.player.lastName}
										</p>
										{!link.player.status && (
											<p className="text-xs text-muted-foreground">Inactive</p>
										)}
									</div>

									<AlertDialog>
										<AlertDialogTrigger
											render={
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="text-destructive hover:text-destructive"
													disabled={isPending}>
													Remove
												</Button>
											}
										/>

										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Remove player access?
												</AlertDialogTitle>
												<AlertDialogDescription>
													This will remove {link.player.firstName}{" "}
													{link.player.lastName}
													from this account. The user will no longer be able to
													access this player&apos;s information.
												</AlertDialogDescription>
											</AlertDialogHeader>

											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleRemove(link.player.id)}
													disabled={isPending}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
													Remove Access
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							))
						)}
					</div>
				</div>{" "}
			</DialogContent>
		</Dialog>
	);
}
