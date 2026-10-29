import { prisma } from "@/lib/prisma";

export async function getAdminFundraiserOverview() {
	const fundraisers = await prisma.fundraiser.findMany({
		orderBy: {
			updatedAt: "desc",
		},
		select: {
			id: true,
			name: true,
			isCompleted: true,
			isPublished: true,
		},
	});

	return fundraisers.map((fundraiser) => ({
		...fundraiser,
		status: fundraiser.isPublished
			? "Published"
			: fundraiser.isCompleted
				? "Completed"
				: "Draft",
	}));
}
