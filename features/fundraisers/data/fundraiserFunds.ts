import { prisma } from "@/lib/prisma";

import type { FundraiserFund } from "@/prisma/client";

export async function getFundraiserFunds(
	fundraiserId: string,
): FundraiserFund[] {
	return prisma.fundraiserFund.findMany({
		where: {
			fundraiserId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function getFundraiserTotal(
	fundraiserId: string,
): Promise<number> {
	const result = await prisma.fundraiserFund.aggregate({
		where: {
			fundraiserId,
		},
		_sum: {
			amount: true,
		},
	});

	return Number(result._sum.amount ?? 0);
}
