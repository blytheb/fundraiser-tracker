"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { FundraiserFormData } from "@/features/fundraisers/types";

export async function createFundraiserAndAddToTeam(
	teamId: string,
	data: FundraiserFormData,
) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			const fundraiser = await tx.fundraiser.create({
				data: {
					name: data.name,
					description: "No description",
					startDate: new Date("2010-01-01"),
				},
			});

			await tx.fundraiserTeam.create({
				data: {
					teamId,
					fundraiserId: fundraiser.id,
				},
			});

			return fundraiser;
		});
	});
}
