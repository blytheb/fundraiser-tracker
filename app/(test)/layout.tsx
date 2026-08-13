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
