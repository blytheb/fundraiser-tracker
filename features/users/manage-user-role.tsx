"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@prisma/client";
import { updateUserRole } from "@/features/users/actions/update-user-role";

type ManageUserRoleProps = {
	userId: string;
	currentRole: UserRole;
};

export function ManageUserRole({ userId, currentRole }: ManageUserRoleProps) {
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState("");
	const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

	function handleSave() {
		if (selectedRole === currentRole) return;

		setError("");

		startTransition(async () => {
			try {
				await updateUserRole(userId, selectedRole);
			} catch (error) {
				setError(
					error instanceof Error
						? error.message
						: "Unable to update user role.",
				);
			}
		});
	}

	return (
		<div className="flex flex-col gap-2">
			<select
				value={selectedRole}
				onChange={(event) => setSelectedRole(event.target.value as UserRole)}
				disabled={isPending}
				className="rounded-lg border bg-background px-3 py-2 text-sm">
				<option value="PARENT">Parent</option>
				<option value="ADMIN">Admin</option>
				<option value="ADMIN_PARENT">Admin + Parent</option>
			</select>

			<button
				type="button"
				onClick={handleSave}
				disabled={isPending || selectedRole === currentRole}
				className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
				{isPending ? "Saving..." : "Save Role"}
			</button>

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
