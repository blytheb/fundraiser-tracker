"use client";

import { useRouter } from "next/navigation";

type ViewSwitcherProps = {
	currentView: "admin" | "parent";
};

export default function ViewSwitcher({ currentView }: ViewSwitcherProps) {
	const router = useRouter();

	const isAdminView = currentView === "admin";
	function handleSwitch() {
		router.push(isAdminView ? "my-players" : "/admin");
	}

	return (
		<button
			type="button"
			onClick={handleSwitch}
			className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
			{isAdminView ? "Switch to Parent View" : "Switch to Admin View"}
		</button>
	);
}
