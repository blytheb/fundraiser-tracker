"use server";

import { prisma } from "@/lib/prisma";
// voidAllocations();

export async function getParticipantFinancialSummary(
	fundraiserParticipantId: string,
) {
	const participant = await prisma.fundraiserParticipant.findUnique({
		where: {
			id: fundraiserParticipantId,
		},
		include: {
			player: true,
		},
	});

	if (!participant) {
		throw new Error("Fundraiser participant not found");
	}

	// Get all active allocations for this participant
	const allocations = await prisma.allocation.findMany({
		where: {
			fundraiserParticipantId,
			status: "ACTIVE",
		},
		include: {
			transactions: {
				where: {
					type: "DISTRIBUTION",
				},
				select: {
					amount: true,
				},
			},
		},
	});

	const allocationAmount = allocations.reduce(
		(total, allocation) => total + Number(allocation.amount),
		0,
	);
	const distributedAmount = allocations.reduce(
		(total, allocation) =>
			total +
			allocation.transactions.reduce(
				(sum, transaction) => sum + Number(transaction.amount),
				0,
			),
		0,
	);

	const remainingAmount = Math.max(0, allocationAmount - distributedAmount);
	return {
		participant,
		allocationAmount,
		distributedAmount,
		remainingAmount,
	};
}
export async function getFundraiserFinancialSummary(fundraiserId: string) {
	// Implementation for getting financial summary
	const fundraiser = await prisma.fundraiser.findUnique({
		where: { id: fundraiserId },
		select: {
			id: true,
		},
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	const [contributions, allocations, participantCount] = await Promise.all([
		prisma.fundraiserContribution.aggregate({
			where: { fundraiserId },
			_sum: { amount: true },
		}),
		prisma.allocation.aggregate({
			where: { fundraiserParticipant: { fundraiserId }, status: "ACTIVE" },
			_sum: { amount: true },
		}),
		prisma.fundraiserParticipant.count({
			where: { fundraiserId },
		}),
	]);

	const totalRaised = Number(contributions._sum.amount ?? 0);
	const currentlyAllocated = Number(allocations._sum.amount ?? 0);
	const availableToAllocate = Math.max(0, totalRaised - currentlyAllocated);

	return {
		totalRaised,
		currentlyAllocated,
		availableToAllocate,
		participantCount,
	};
}

export async function setEqualDistribution(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const participants = await tx.fundraiserParticipant.findMany({
			where: {
				fundraiserId,
			},
		});

		if (participants.length === 0) {
			throw new Error("No participants found");
		}

		const contributions = await tx.fundraiserContribution.aggregate({
			where: {
				fundraiserId,
			},
			_sum: {
				amount: true,
			},
		});

		const allocations = await tx.allocation.aggregate({
			where: {
				fundraiserParticipant: {
					fundraiserId,
				},
				status: "ACTIVE",
			},
			_sum: {
				amount: true,
			},
		});

		const totalRaised = Number(contributions._sum.amount ?? 0);
		const currentlyAllocated = Number(allocations._sum.amount ?? 0);

		const availableToAllocate = totalRaised - currentlyAllocated;

		if (availableToAllocate <= 0) {
			throw new Error("No money available to distribute");
		}

		const totalCents = Math.round(availableToAllocate * 100);

		const participantCount = participants.length;

		const centsPerPlayer = Math.floor(totalCents / participantCount);

		const remainder = totalCents % participantCount;

		const newAllocations = participants.map((participant, index) => {
			const allocationCents = centsPerPlayer + (index < remainder ? 1 : 0);

			return {
				fundraiserParticipantId: participant.id,
				amount: allocationCents / 100,
				status: "ACTIVE" as const,
			};
		});

		await tx.allocation.createMany({
			data: newAllocations,
		});

		return newAllocations;
	});
}

type CustomAllocation = {
	participantId: string;
	amount: number;
};

export async function setCustomDistribution(
	fundraiserId: string,
	allocations: CustomAllocation[],
) {
	return prisma.$transaction(async (tx) => {
		const participants = await tx.fundraiserParticipant.findMany({
			where: {
				fundraiserId,
			},
		});

		if (participants.length === 0) {
			throw new Error("No participants found");
		}

		//make sure every participant belongs to this fundraiser
		const participantIds = new Set(
			participants.map((participant) => participant.id),
		);

		for (const allocation of allocations) {
			if (!participantIds.has(allocation.participantId)) {
				throw new Error(
					`Participant ${allocation.participantId} does not belong to fundraiser ${fundraiserId}`,
				);
			}

			if (allocation.amount < 0) {
				throw new Error(
					`Allocation amount for participant ${allocation.participantId} cannot be negative`,
				);
			}
		}

		//get total money raised
		const contributions = await tx.fundraiserContribution.aggregate({
			where: {
				fundraiserId,
			},
			_sum: {
				amount: true,
			},
		});

		//get money already allocated
		const currentAllocations = await tx.allocation.aggregate({
			where: {
				fundraiserParticipant: {
					fundraiserId,
				},
				status: "ACTIVE",
			},
			_sum: {
				amount: true,
			},
		});

		const totalRaised = Number(contributions._sum.amount ?? 0);
		const currentlyAllocated = Number(currentAllocations._sum.amount ?? 0);
		const availableToAllocate = totalRaised - currentlyAllocated;

		//convert everything to cents
		const requestedCents = allocations.reduce(
			(total, allocation) => total + Math.round(allocation.amount * 100),
			0,
		);

		const availableCents = Math.round(availableToAllocate * 100);

		if (requestedCents > availableCents) {
			throw new Error(
				`Requested allocation of ${requestedCents / 100} exceeds available funds of ${availableCents / 100}`,
			);
		}

		//create the new allocations
		const newAllocations = allocations
			.filter((allocation) => allocation.amount > 0)
			.map((allocation) => ({
				fundraiserParticipantId: allocation.participantId,
				amount: Math.round(allocation.amount * 100) / 100,
				status: "ACTIVE" as const,
			}));

		await tx.allocation.createMany({
			data: newAllocations,
		});

		return newAllocations;
	});
}

export async function redistributeFunds(
	fundraiserId: string,
	allocations: CustomAllocation[],
) {
	return prisma.$transaction(async (tx) => {
		const participants = await tx.fundraiserParticipant.findMany({
			where: {
				fundraiserId,
			},
		});

		if (participants.length === 0) {
			throw new Error("No participants found");
		}

		const participantIds = new Set(
			participants.map((participant) => participant.id),
		);

		//validate partiicipants and amounts
		for (const allocation of allocations) {
			if (!participantIds.has(allocation.participantId)) {
				throw new Error(
					`Participant ${allocation.participantId} does not belong to fundraiser ${fundraiserId}`,
				);
			}

			if (allocation.amount < 0) {
				throw new Error(
					`Allocation amount for participant ${allocation.participantId} cannot be negative`,
				);
			}
		}

		//get total money raised
		const contributions = await tx.fundraiserContribution.aggregate({
			where: {
				fundraiserId,
			},
			_sum: {
				amount: true,
			},
		});

		const totalRaised = Number(contributions._sum.amount ?? 0);
		const requestedCents = allocations.reduce(
			(total, allocation) => total + Math.round(allocation.amount * 100),
			0,
		);
		const totalRaisedCents = Math.round(totalRaised * 100);

		//new distribution must account for ALL fundraiser money
		if (requestedCents !== totalRaisedCents) {
			throw new Error(
				`Requested allocation of ${requestedCents / 100} does not match total raised of ${totalRaisedCents / 100}`,
			);
		}

		//void the current active allocations
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

		//create the new allocations
		const newAllocations = allocations
			.filter((allocation) => allocation.amount > 0)
			.map((allocation) => ({
				fundraiserParticipantId: allocation.participantId,
				amount: Math.round(allocation.amount * 100) / 100,
				status: "ACTIVE" as const,
			}));

		await tx.allocation.createMany({
			data: newAllocations,
		});

		return newAllocations;
	});
}

export async function getActiveFundraiserAllocations(fundraiserId: string) {
	const allocations = await prisma.allocation.findMany({
		where: {
			fundraiserParticipant: {
				fundraiserId,
			},
			status: "ACTIVE",
		},
		select: {
			id: true,
			fundraiserParticipantId: true,
			amount: true,
			status: true,
		},
	});

	return allocations.map((allocation) => ({
		...allocation,
		amount: Number(allocation.amount),
	}));
}
