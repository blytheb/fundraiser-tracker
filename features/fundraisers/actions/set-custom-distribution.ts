"use server";

import { prisma } from "@/lib/prisma";

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
			const existingAllocations = await tx.fundraiserAllocation.findMany({
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
					await tx.fundraiserAllocation.updateMany({
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
					await tx.fundraiserAllocation.create({
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
