import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import PublicNavbar from "@/components/ui-reusable/PublicNavbar";

export const metadata: Metadata = {
	title: "Fundraiser Tracker",
	description: "Manage teams, players, fundraisers, and player accounts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className="h-full antialiased">
			<body className="h-full flex flex-col">
				<TooltipProvider>
					<PublicNavbar />
					<main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
				</TooltipProvider>
			</body>
		</html>
	);
}
