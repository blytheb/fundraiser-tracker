import { prisma } from "@/lib/prisma";

export async function getFundraiserTotal(fundraiserId: string) {
	const result = await prisma.fundraiserFund.aggregate({
		where: {
			fundraiserId,
		},
		_sum: {
			amount: true,
		},
	});

	return result._sum.amount ?? 0;
}
