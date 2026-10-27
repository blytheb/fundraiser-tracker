import Navbar from "@/components/reusable/Navbar";

export default async function TestLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col min-h-screen">
			<Navbar role={null} name="hidden_layout" email="hidden_layout" />
			<main>{children}</main>
		</div>
	);
}
