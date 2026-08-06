"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
	const router = useRouter();

	async function handleLogout() {
		await authClient.logout();
		router.push("/login");
		router.refresh();
	}

	return <button onClick={handleLogout}>logout-button</button>;
}
