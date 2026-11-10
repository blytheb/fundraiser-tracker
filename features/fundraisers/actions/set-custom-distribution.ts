"use server";

import { runAction } from "@/lib/action-result";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

type CustomAllocation = {
	participantId: string;
	amount: number;
};

//every participant in the fundraiser ends up with exactly one ACTIVE allocation.
//participants left out of the request (or left blank) are allocated $0.
export async function setCustomDistribution(
	fundraiserId: string,
	allocations: CustomAllocation[],
) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(
			async (tx) => {
				const fundraiser = await tx.fundraiser.findUnique({
					where: { id: fundraiserId },
					select: { status: true },
				});

				if (!fundraiser) {
					throw new Error("Fundraiser not found");
				}

				if (fundraiser.status !== "DRAFT") {
					throw new Error("Completed fundraisers cannot be edited.");
				}

				const participants = await tx.fundraiserParticipant.findMany({
					where: { fundraiserId },
					select: { id: true },
				});

				if (participants.length === 0) {
					throw new Error("No participants found");
				}

				//start every participant at $0, then apply submitted amounts
				const desiredByParticipant = new Map<string, Prisma.Decimal>(
					participants.map((p) => [p.id, new Prisma.Decimal(0)]),
				);

				const seen = new Set<string>();
				for (const allocation of allocations) {
					if (!desiredByParticipant.has(allocation.participantId)) {
						throw new Error(
							`Participant ${allocation.participantId} does not belong to fundraiser ${fundraiserId}`,
						);
					}

					if (seen.has(allocation.participantId)) {
						throw new Error(
							`Participant ${allocation.participantId} was submitted more than once`,
						);
					}
					seen.add(allocation.participantId);

					if (!Number.isFinite(allocation.amount)) {
						throw new Error(
							`Allocation amount for participant ${allocation.participantId} is not a valid number`,
						);
					}

					const amount = new Prisma.Decimal(allocation.amount).toDecimalPlaces(
						2,
						Prisma.Decimal.ROUND_HALF_UP,
					);

					if (amount.isNegative()) {
						throw new Error(
							`Allocation amount for participant ${allocation.participantId} cannot be negative`,
						);
					}

					desiredByParticipant.set(allocation.participantId, amount);
				}

				const contributions = await tx.fundraiserContribution.aggregate({
					where: { fundraiserId },
					_sum: { amount: true },
				});

				const totalRaised = contributions._sum.amount ?? new Prisma.Decimal(0);
				const requestedTotal = Prisma.Decimal.sum(
					...desiredByParticipant.values(),
				);

				if (!requestedTotal.equals(totalRaised)) {
					throw new Error(
						`Total allocation of ${requestedTotal.toFixed(2)} does not match total raised of ${totalRaised.toFixed(2)}`,
					);
				}

				const existingAllocations = await tx.fundraiserAllocation.findMany({
					where: {
						fundraiserParticipant: { fundraiserId },
						status: "ACTIVE",
					},
					select: {
						id: true,
						fundraiserParticipantId: true,
						amount: true,
					},
				});

				const existingByParticipant = new Map<
					string,
					typeof existingAllocations
				>();
				for (const allocation of existingAllocations) {
					const list =
						existingByParticipant.get(allocation.fundraiserParticipantId) ?? [];
					list.push(allocation);
					existingByParticipant.set(allocation.fundraiserParticipantId, list);
				}

				for (const [participantId, desiredAmount] of desiredByParticipant) {
					const existing = existingByParticipant.get(participantId) ?? [];

					//already exactly one active allocation with the same amount: nothing to do
					if (existing.length === 1 && existing[0].amount.equals(desiredAmount)) {
						continue;
					}

					if (existing.length > 0) {
						await tx.fundraiserAllocation.updateMany({
							where: { id: { in: existing.map((a) => a.id) } },
							data: { status: "VOID" },
						});
					}

					//always create an allocation, even for $0
					await tx.fundraiserAllocation.create({
						data: {
							fundraiserParticipantId: participantId,
							amount: desiredAmount,
							status: "ACTIVE",
						},
					});
				}

				return Array.from(desiredByParticipant, ([participantId, amount]) => ({
					participantId,
					amount: amount.toNumber(),
				}));
			},
			{
				timeout: 10000,
			},
		);
	});
}
