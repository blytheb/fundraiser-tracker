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
	const fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id: data.fundraiserId,
		},
		select: {
			isCompleted: true,
		},
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (fundraiser.isCompleted) {
		throw new Error("Completed Fundraisers cannot be edited");
	}
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
	const contribution = await prisma.fundraiserContribution.findUnique({
		where: {
			id,
		},
		select: {
			fundraiserId: true,
		},
	});

	if (!contribution) {
		throw new Error("Contribution not found");
	}

	const fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id: contribution.fundraiserId,
		},
		select: {
			isCompleted: true,
		},
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (fundraiser.isCompleted) {
		throw new Error("Completed Fundraisers cannot be edited");
	}

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
	const contribution = await prisma.fundraiserContribution.findUnique({
		where: {
			id,
		},
		select: {
			fundraiserId: true,
		},
	});

	if (!contribution) {
		throw new Error("Contribution not found");
	}

	const fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id: contribution.fundraiserId,
		},
		select: {
			isCompleted: true,
		},
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (fundraiser.isCompleted) {
		throw new Error("Completed Fundraisers cannot be edited");
	}

	await prisma.fundraiserContribution.delete({
		where: {
			id,
		},
	});
}
