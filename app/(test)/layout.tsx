import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import LogoutButton from "@/components/logout-button";
import Sidebar from "@/components/sidebar";

export default async function TestLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col min-h-screen">
			<Sidebar />
			<main>{children}</main>
		</div>
	);
}
