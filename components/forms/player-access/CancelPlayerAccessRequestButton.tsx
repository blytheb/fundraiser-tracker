"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelPlayerAccessRequest } from "@/features/player-access/actions/cancel-player-access-request";

export function CancelPlayerAccessRequestButton({
	requestId,
}: {
	requestId: string;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState("");

	function handleCancel() {
		const confirmed = window.confirm(
			"Are you sure you want to cancel this access request?",
		);

		if (!confirmed) return;

		setError("");

		startTransition(async () => {
			try {
				await cancelPlayerAccessRequest(requestId);
				router.refresh();
			} catch (error) {
				setError(
					error instanceof Error ? error.message : "Unable to cancel request.",
				);
			}
		});
	}

	return (
		<div>
			<button
				type="button"
				onClick={handleCancel}
				disabled={isPending}
				className="text-sm font-medium text-destructive underline underline-offset-4 disabled:opacity-50">
				{isPending ? "Canceling..." : "Cancel request"}
			</button>

			{error && (
				<p role="alert" className="mt-1 text-sm text-destructive">
					{error}
				</p>
			)}
		</div>
	);
}
