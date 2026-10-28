import { prisma } from "@/lib/prisma";

export async function getFundraiserContributions(fundraiserId: string) {
	const contributions = await prisma.fundraiserContribution.findMany({
		where: {
			fundraiserId,
		},
		orderBy: {
			date: "desc",
		},
	});

	return contributions.map((contribution) => ({
		...contribution,
		amount: Number(contribution.amount),
	}));
}
