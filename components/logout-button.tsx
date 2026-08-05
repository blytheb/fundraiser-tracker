"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
	const router = useRouter();

	async function logout() {
		await authClient.signOut();

		router.push("/login");
	}

	return (
		<button onClick={logout} className="mt-6">
			Logout
		</button>
	);
}
