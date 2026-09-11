"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
	const router = useRouter();

	async function handleLogout() {
		await authClient.signOut();
		router.push("/");
		router.refresh();
	}

	return (
		<Button variant="outline" onClick={handleLogout}>
			Log out
		</Button>
	);
}
