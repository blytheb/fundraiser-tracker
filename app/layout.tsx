import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
	title: "Fundraiser Tracker",
	description: "Manage teams, players, fundraisers, and player accounts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className="h-full antialiased">
			<body className="min-h-full flex flex-col flex-1">
				<TooltipProvider>{children}</TooltipProvider>
			</body>
		</html>
	);
}
