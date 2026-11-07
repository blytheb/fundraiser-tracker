"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ViewSwitcherProps = {
	currentView: "admin" | "parent";
};

const VIEW_HOME = {
	admin: "/admin/dashboard",
	parent: "/parent/my-players",
} as const;

// switch ON = parent view, OFF = admin view
export default function ViewSwitcher({ currentView }: ViewSwitcherProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const isParentView = currentView === "parent";

	function handleSwitch(checked: boolean) {
		const nextView = checked ? "parent" : "admin";
		if (nextView === currentView) return;

		startTransition(() => {
			router.push(VIEW_HOME[nextView]);
		});
	}

	return (
		<div className="flex items-center gap-2">
			<Switch
				id="view-mode"
				size="sm"
				checked={isParentView}
				onCheckedChange={handleSwitch}
				disabled={isPending}
			/>
			<Label htmlFor="view-mode" className="cursor-pointer text-sm">
				{isPending ? "Switching..." : "Parent view"}
			</Label>
		</div>
	);
}
