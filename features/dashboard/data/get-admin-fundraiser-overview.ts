import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function getAdminFundraiserOverview() {
	await requireAdmin();
	const fundraisers = await prisma.fundraiser.findMany({
		orderBy: {
			updatedAt: "desc",
		},
		select: {
			id: true,
			name: true,
			status: true,
		},
	});

	return fundraisers;
}
