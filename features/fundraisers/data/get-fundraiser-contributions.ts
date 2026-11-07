import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function getFundraiserContributions(fundraiserId: string) {
	await requireAdmin();
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
