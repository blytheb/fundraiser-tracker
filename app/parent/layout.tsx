import ParentNavbar from "@/components/reusable/ParentNavbar";
import { requireParentAccess } from "@/lib/permissions";

export default async function ParentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await requireParentAccess();

	return (
		<div className="flex h-screen flex-col">
			<ParentNavbar role={user.role} name={user.name} email={user.email} />

			<main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
