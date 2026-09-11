import Navbar from "@/components/ui-reusable/Navbar";

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<Navbar />
			<main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
