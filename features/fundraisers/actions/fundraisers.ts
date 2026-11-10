"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { assertDraft } from "@/features/fundraisers/lib/fundraiser-status";
import type { FundraiserFormData } from "../types";

export async function createFundraiser(data: FundraiserFormData) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.fundraiser.create({ data });
	});
}

export async function updateFundraiser(id: string, data: FundraiserFormData) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await assertDraft(tx, id);

			return tx.fundraiser.update({
				where: { id },
				data,
			});
		});
	});
}

export async function deleteFundraiser(id: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			await assertDraft(tx, id, "deleted");

			return tx.fundraiser.delete({
				where: { id },
			});
		});
	});
}
