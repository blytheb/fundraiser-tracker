import { prisma } from "@/lib/prisma";

export async function getAdminFundraiserOverview() {
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
