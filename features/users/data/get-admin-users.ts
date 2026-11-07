import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function getAdminUsers() {
	await requireAdmin();
	return await prisma.user.findMany({
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			createdAt: true,
			playerLinks: {
				select: {
					id: true,
					player: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							status: true,
						},
					},
				},
			},
		},
	});
}
