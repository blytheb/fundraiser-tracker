import Navbar from "@/components/ui-reusable/Navbar";

export default async function TestLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main>{children}</main>
		</div>
	);
}
