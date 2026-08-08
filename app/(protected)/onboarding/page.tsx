import React from "react";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
	const session = await getSession();

	if (!session) {
		redirect("/login");
	}

	return (
		<div className="w-full max-w-md">
			<h1>Welcome, {session.user.name}</h1>
			<p className="mt-2 text-muted-foreground">
				Lets get your organization set up.
			</p>
		</div>
	);
}
