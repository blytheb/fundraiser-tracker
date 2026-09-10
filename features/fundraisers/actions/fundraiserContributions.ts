"use server";

import { prisma } from "@/lib/prisma";
import type { ContributionType, PaymentMethod } from "@prisma/client";

type ContributionData = {
	fundraiserId: string;
	amount: number;
	paymentMethod: PaymentMethod;
	source: ContributionType;
	date: string;
	description?: string;
};

export async function addContribution(data: ContributionData) {
	await prisma.fundraiserContribution.create({
		data: {
			fundraiserId: data.fundraiserId,
			amount: data.amount,
			paymentMethod: data.paymentMethod,
			source: data.source,
			date: new Date(data.date),
			description: data.description,
		},
	});
}

export async function updateContribution(
	id: string,
	data: Omit<ContributionData, "fundraiserId">,
) {
	await prisma.fundraiserContribution.update({
		where: {
			id,
		},
		data: {
			amount: data.amount,
			paymentMethod: data.paymentMethod,
			source: data.source,
			date: new Date(data.date),
			description: data.description,
		},
	});
}

export async function deleteContribution(id: string) {
	await prisma.fundraiserContribution.delete({
		where: {
			id,
		},
	});
}
