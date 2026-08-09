import React from "react";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";

export default async function AdminPage() {
	const session = await getSession();

	if (!session) {
		redirect("/login");
	}
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold">Admin Dashboard</h1>
			<p className="mt-2 text-muted-foreground">Welcome, {session.user.name}</p>
			<LogoutButton />
		</div>
	);
}
