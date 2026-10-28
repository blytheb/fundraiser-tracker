import Navbar from "@/components/reusable/Navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/");
	}
	return (
		<div className="flex h-screen flex-col">
			<Navbar
				role={session.user.role}
				name={session.user.name}
				email={session.user.email}
				hasParentAccess={session.user.hasParentAccess ?? false}
			/>

			<main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
