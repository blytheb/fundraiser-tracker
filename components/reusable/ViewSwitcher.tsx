"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ViewSwitcherProps = {
	currentView: "admin" | "parent";
};

export default function ViewSwitcher({ currentView }: ViewSwitcherProps) {
	const router = useRouter();

	const isAdminView = currentView === "admin";
	function handleSwitch() {
		router.push(isAdminView ? "my-players" : "/dashboard");
	}

	return (
		// <button
		// 	type="button"
		// 	onClick={handleSwitch}
		// 	className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
		// 	{isAdminView ? "Switch to Parent View" : "Switch to Admin View"}
		// </button>
		<div className="flex items-center space-x-2">
			<Switch id="view-mode" onCheckedChange={handleSwitch} size="sm" />
			<Label htmlFor="view-mode">
				{isAdminView ? "Switch to Parent View" : "Switch to Admin View"}
			</Label>
		</div>
	);
}
