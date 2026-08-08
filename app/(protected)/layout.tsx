import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import LogoutButton from "@/components/logout-button";
import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<div>
				<header>
					<h1>Fundraiser Tracker</h1>
					<p>{session.user.email}</p>
					<LogoutButton />
				</header>

				<main>{children}</main>
			</div>
		</div>
	);
}
