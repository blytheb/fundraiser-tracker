import { prisma } from "@/lib/prisma";
import type { Fundraiser } from "@prisma/client";
import { requireAdmin } from "@/lib/permissions";

//get All fundraisers
export async function getFundraisers(search?: string): Promise<Fundraiser[]> {
	await requireAdmin();
	return await prisma.fundraiser.findMany({
		where: search
			? {
					name: {
						contains: search,
						mode: "insensitive",
					},
				}
			: undefined,

		orderBy: {
			startDate: "desc",
		},
	});
}

//get One fundraiser
export async function getFundraiserById(
	id: string,
): Promise<Fundraiser | null> {
	await requireAdmin();
	return await prisma.fundraiser.findUnique({
		where: {
			id,
		},
	});
}
