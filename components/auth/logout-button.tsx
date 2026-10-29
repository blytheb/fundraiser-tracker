"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleLogout() {
		setLoading(true);
		setError("");

		try {
			const result = await authClient.signOut();

			if (result.error) {
				setError("Unable to log out. Please try again.");
				return;
			}

			router.push("/");
			router.refresh();
		} catch {
			setError("Unable to log out. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col items-end gap-1">
			<Button variant="outline" onClick={handleLogout} disabled={loading}>
				{loading ? "Logging out..." : "Log out"}
			</Button>

			{error && (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
