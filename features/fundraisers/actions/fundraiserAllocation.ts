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
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
			select: {
				isCompleted: true,
			},
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.isCompleted) {
			throw new Error("Completed fundraisers cannot be edited.");
		}

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
	return prisma.$transaction(
		async (tx) => {
			// Check fundraiser
			const fundraiser = await tx.fundraiser.findUnique({
				where: {
					id: fundraiserId,
				},
				select: {
					isCompleted: true,
				},
			});

			if (!fundraiser) {
				throw new Error("Fundraiser not found");
			}

			if (fundraiser.isCompleted) {
				throw new Error("Completed fundraisers cannot be edited.");
			}

			// Get participants
			const participants = await tx.fundraiserParticipant.findMany({
				where: {
					fundraiserId,
				},
				select: {
					id: true,
				},
			});

			if (participants.length === 0) {
				throw new Error("No participants found");
			}

			const participantIds = new Set(
				participants.map((participant) => participant.id),
			);

			// Validate submitted participants and amounts
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

			// Get total money raised
			const contributions = await tx.fundraiserContribution.aggregate({
				where: {
					fundraiserId,
				},
				_sum: {
					amount: true,
				},
			});

			const totalRaised = Number(contributions._sum.amount ?? 0);

			// Convert submitted total to cents
			const requestedCents = allocations.reduce(
				(total, allocation) => total + Math.round(allocation.amount * 100),
				0,
			);

			const totalRaisedCents = Math.round(totalRaised * 100);

			// Make sure all raised money is allocated
			if (requestedCents !== totalRaisedCents) {
				throw new Error(
					`Total allocation of ${
						requestedCents / 100
					} does not match total raised of ${totalRaisedCents / 100}`,
				);
			}

			// Get existing active allocations
			const existingAllocations = await tx.allocation.findMany({
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
				},
			});

			//calculate current total for each participant
			const currentByParticipant = new Map<string, number>();

			for (const allocation of existingAllocations) {
				const current =
					currentByParticipant.get(allocation.fundraiserParticipantId) ?? 0;
				currentByParticipant.set(
					allocation.fundraiserParticipantId,
					current + Number(allocation.amount),
				);
			}

			//update only participants whose allocation changed
			for (const allocation of allocations) {
				const currentAmount =
					currentByParticipant.get(allocation.participantId) ?? 0;

				const desiredAmount = allocation.amount;

				const currentCents = Math.round(currentAmount * 100);
				const desiredCents = Math.round(desiredAmount * 100);

				//nothing changes
				if (currentCents === desiredCents) {
					continue;
				}

				//void existing active allocations for this participant
				const participantAllocations = existingAllocations.filter(
					(existing) =>
						existing.fundraiserParticipantId === allocation.participantId,
				);

				if (participantAllocations.length > 0) {
					await tx.allocation.updateMany({
						where: {
							id: {
								in: participantAllocations.map((existing) => existing.id),
							},
						},
						data: {
							status: "VOID",
						},
					});
				}

				// create new allocation only if the desired amount is greater than 0
				if (desiredAmount > 0) {
					await tx.allocation.create({
						data: {
							fundraiserParticipantId: allocation.participantId,
							amount: Math.round(desiredAmount * 100) / 100,
							status: "ACTIVE",
						},
					});
				}
			}
			return allocations;
		},
		{
			timeout: 10000,
		},
	);
}

export async function redistributeFunds(
	fundraiserId: string,
	allocations: CustomAllocation[],
) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
			select: {
				isCompleted: true,
			},
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.isCompleted) {
			throw new Error("Completed fundraisers cannot be edited.");
		}

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
