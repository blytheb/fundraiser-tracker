"use server";

import { runAction } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import type { Fundraiser } from "@prisma/client";
import type { FundraiserFormData } from "../types";

export async function createFundraiser(
	data: FundraiserFormData,
) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.fundraiser.create({ data });
	});
}

export async function updateFundraiser(
	id: string,
	data: FundraiserFormData,
) {
	return runAction(async () => {
		await requireAdmin();

		const fundraiser = await prisma.fundraiser.findUnique({
			where: { id },
			select: { status: true },
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.status !== "DRAFT") {
			throw new Error("Completed fundraisers cannot be edited.");
		}

		return prisma.fundraiser.update({
			where: { id },
			data,
		});
	});
}

export async function deleteFundraiser(id: string) {
	return runAction(async () => {
		await requireAdmin();

		const fundraiser = await prisma.fundraiser.findUnique({
			where: { id },
			select: { status: true },
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.status !== "DRAFT") {
			throw new Error("Completed fundraisers cannot be deleted.");
		}

		return prisma.fundraiser.delete({
			where: { id },
		});
	});
}
