"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { assertDraft } from "@/features/fundraisers/lib/fundraiser-status";

export async function removeTeamFromFundraiser(
	fundraiserId: string,
	teamId: string,
) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await assertDraft(tx, fundraiserId);

			return tx.fundraiserTeam.delete({
				where: {
					fundraiserId_teamId: { fundraiserId, teamId },
				},
			});
		});
	});
}
