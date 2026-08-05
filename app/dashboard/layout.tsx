import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import LogoutButton from "@/components/logout-button";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session) {
		redirect("/login");
	}
	return (
		<div className="flex min-h-screen">
			{/* Sidebar */}
			<aside className="w-64 border-r p-5">
				<h2 className="text-xl font-bold mb-6">Fundraiser Tracker</h2>

				<nav className="flex flex-col gap-3">
					<Link href="/dashboard">Dashboard</Link>

					<Link href="/dashboard/seasons">Seasons</Link>

					<Link href="/dashboard/players">Players</Link>

					<Link href="/dashboard/fundraisers">Fundraisers</Link>

					<Link href="/dashboard/ledger">Ledger</Link>
				</nav>
				<LogoutButton />
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-8">{children}</main>
		</div>
	);
}
