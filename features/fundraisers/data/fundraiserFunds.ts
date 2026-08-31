import { prisma } from "@/lib/prisma";

// import type { FundraiserFund } from "@/prisma/client";
import type { FundraiserFundListItem } from "@/feature/fundraisers/types";

export async function getFundraiserFunds(
	fundraiserId: string,
): FundraiserFundListItem[] {
	const funds = await prisma.fundraiserFund.findMany({
		where: {
			fundraiserId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return funds.map((fund) => ({
		id: fund.id,
		type: fund.type,
		amount: Number(fund.amount),
		description: fund.description,
		fundraiserId: fund.fundraiserId,
		createdAt: fund.createdAt.toISOString(),
	}));
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
