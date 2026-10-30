import AdminNavbar from "@/components/reusable/AdminNavbar";

export default async function TestLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col min-h-screen">
			<AdminNavbar role={null} name="hidden_layout" email="hidden_layout" />
			<main>{children}</main>
		</div>
	);
}
