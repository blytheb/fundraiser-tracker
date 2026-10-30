"use server";

import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

export async function updateUserRole(userId: string, newRole: UserRole) {
	const admin = await requireAdmin();

	if (!userId) {
		throw new Error("User ID is required.");
	}

	if (!Object.values(UserRole).includes(newRole)) {
		throw new Error("Invalid user role.");
	}

	// Prevent admins from changing their own role.
	if (admin.id === userId) {
		throw new Error("You cannot change your own role.");
	}

	//check whether the target user exists

	await prisma.$transaction(
		async (tx) => {
			const targetUser = await tx.user.findUnique({
				where: { id: userId },
				select: { id: true, role: true },
			});

			if (!targetUser) {
				throw new Error("User not found.");
			}

			const isCurrentlyAdmin =
				targetUser.role === "ADMIN" || targetUser.role === "ADMIN_PARENT";

			const willRemainAdmin = newRole === "ADMIN" || newRole === "ADMIN_PARENT";

			if (isCurrentlyAdmin && !willRemainAdmin) {
				const adminCount = await tx.user.count({
					where: { role: { in: ["ADMIN", "ADMIN_PARENT"] } },
				});

				if (adminCount <= 1) {
					throw new Error("You cannot remove the last administrator.");
				}
			}

			await tx.user.update({
				where: { id: userId },
				data: { role: newRole },
			});
		},
		{
			isolationLevel: "Serializable",
		},
	);
	revalidatePath("/admin/users");
}
