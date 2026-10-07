//when does the fundraiser become official
"use server";

import { prisma } from "@/lib/prisma";

export async function publishFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
			select: {
				isCompleted: true,
				isPublished: true,
			},
			include: {
				participants: true,
			},
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (!fundraiser.isCompleted) {
			throw new Error("Fundraiser is not completed and cannot be published");
		}

		if (fundraiser.isPublished) {
			throw new Error("Fundraiser is already published");
		}

		if (fundraiser.participants.length === 0) {
			throw new Error("A fundraiser must have at least one participant");
		}

		await tx.fundraiser.update({
			where: {
				id: fundraiserId,
			},
			data: {
				isPublished: true,
			},
		});

		return {
			success: true,
		};
	});
}

export async function unpublishFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
		});
		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (!fundraiser.isPublished) {
			throw new Error("Fundraiser is already unpublished");
		}

		await tx.allocation.updateMany({
			where: {
				fundraiserParticipant: {
					fundraiserId,
				},
				status: "ACTIVE",
			},
			data: {
				status: "VOID",
			},
		});

		await tx.fundraiser.update({
			where: {
				id: fundraiserId,
			},
			data: {
				isPublished: false,
			},
		});

		return {
			success: true,
		};
	});
}

export async function completeFundraiser(fundraiserId: string) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: { id: fundraiserId },
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (fundraiser.isCompleted) {
		throw new Error("Fundraiser is already completed");
	}

	return prisma.fundraiser.update({
		where: { id: fundraiserId },
		data: { isCompleted: true },
	});
}

export async function draftFundraiser(fundraiserId: string) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: { id: fundraiserId },
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (!fundraiser.isCompleted) {
		throw new Error("Fundraiser is already in draft mode");
	}

	return prisma.fundraiser.update({
		where: { id: fundraiserId },
		data: { isCompleted: false },
	});
}
