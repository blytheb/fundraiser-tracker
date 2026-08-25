import Navbar from "@/components/Navbar";

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
