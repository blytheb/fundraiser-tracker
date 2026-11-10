"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { assertDraft } from "@/features/fundraisers/lib/fundraiser-status";
import type {
	ContributionType,
	PaymentMethod,
	Prisma,
} from "@prisma/client";

type ContributionData = {
	fundraiserId: string;
	amount: number;
	paymentMethod: PaymentMethod;
	source: ContributionType;
	date: string;
	description?: string;
};

// Finds the contribution's fundraiser and checks it's still a draft.
async function assertContributionEditable(
	tx: Prisma.TransactionClient,
	contributionId: string,
) {
	const contribution = await tx.fundraiserContribution.findUnique({
		where: { id: contributionId },
		select: { fundraiserId: true },
	});

	if (!contribution) {
		throw new Error("Contribution not found");
	}

	await assertDraft(tx, contribution.fundraiserId);
}

export async function addContribution(data: ContributionData) {
	return runAction(async () => {
		await requireAdmin();

		await prisma.$transaction(async (tx) => {
			await assertDraft(tx, data.fundraiserId);

			await tx.fundraiserContribution.create({
				data: {
					fundraiserId: data.fundraiserId,
					amount: data.amount,
					paymentMethod: data.paymentMethod,
					source: data.source,
					date: new Date(data.date),
					description: data.description,
				},
			});
		});
	});
}

export async function updateContribution(
	id: string,
	data: Omit<ContributionData, "fundraiserId">,
) {
	return runAction(async () => {
		await requireAdmin();

		await prisma.$transaction(async (tx) => {
			await assertContributionEditable(tx, id);

			await tx.fundraiserContribution.update({
				where: { id },
				data: {
					amount: data.amount,
					paymentMethod: data.paymentMethod,
					source: data.source,
					date: new Date(data.date),
					description: data.description,
				},
			});
		});
	});
}

export async function deleteContribution(id: string) {
	return runAction(async () => {
		await requireAdmin();

		await prisma.$transaction(async (tx) => {
			await assertContributionEditable(tx, id);

			await tx.fundraiserContribution.delete({
				where: { id },
			});
		});
	});
}
