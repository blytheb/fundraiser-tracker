import AdminNavbar from "@/components/reusable/AdminNavbar";
import { requireAdmin } from "@/lib/permissions";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await requireAdmin();

	return (
		<div className="flex h-screen flex-col">
			<AdminNavbar
				role={user.role}
				name={user.name}
				email={user.email}
				hasParentAccess={user.hasParentAccess ?? false}
			/>

			<main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
