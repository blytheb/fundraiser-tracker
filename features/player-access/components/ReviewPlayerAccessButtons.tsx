"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewPlayerAccess } from "@/features/player-access/actions/review-player-access";

type Props = {
	requestId: string;
};

export default function ReviewPlayerAccessvuttons({ requestId }: Props) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function handleReview(decision: "APPROVED" | "REJECTED") {
		setError(null);

		startTransition(async () => {
			try {
				await reviewPlayerAccess(requestId, decision);
				router.refresh();
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Something went wrong. Please try again.",
				);
			}
		});
	}

	return (
		<div className="mt-4">
			<div className="flex gap-3">
				<button
					type="button"
					onClick={() => handleReview("APPROVED")}
					disabled={isPending}
					className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
					{isPending ? "Processing..." : "Approve"}
				</button>
				<button
					type="button"
					onClick={() => handleReview("REJECTED")}
					disabled={isPending}
					className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50">
					Reject
				</button>
			</div>

			{error && (
				<p className="mt-2 text-sm text-red-600" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
