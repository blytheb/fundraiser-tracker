import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiserParticipant: {
			findUnique: vi.fn(),
		},
		fundraiserAllocation: {
			findMany: vi.fn(),
		},
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { getParticipantFinancialSummary } from "@/features/fundraisers/actions/fundraiserAllocation";

describe("getParticipantFinancialSummary", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		prismaMock.fundraiserParticipant.findUnique.mockResolvedValue({
			id: "participant-1",
			player: { id: "player-1" },
		});

		prismaMock.fundraiserAllocation.findMany.mockResolvedValue([
			{
				id: "allocation-1",
				amount: 100,
				transactions: [{ amount: 30 }, { amount: 20 }],
			},
		]);
	});

	it("calculates allocated, distributed, and remaining amounts", async () => {
		const result = await getParticipantFinancialSummary("participant-1");

		expect(result.allocationAmount).toBe(100);
		expect(result.distributedAmount).toBe(50);
		expect(result.remainingAmount).toBe(50);
	});

	it("returns zero amounts when the participant has no allocations", async () => {
		prismaMock.fundraiserAllocation.findMany.mockResolvedValue([]);

		const result = await getParticipantFinancialSummary("participant-1");

		expect(result.allocationAmount).toBe(0);
		expect(result.distributedAmount).toBe(0);
		expect(result.remainingAmount).toBe(0);
	});

	it("never returns a negative remaining amount", async () => {
		prismaMock.fundraiserAllocation.findMany.mockResolvedValue([
			{
				id: "allocation-1",
				amount: 100,
				transactions: [{ amount: 80 }, { amount: 40 }],
			},
		]);

		const result = await getParticipantFinancialSummary("participant-1");

		expect(result.allocationAmount).toBe(100);
		expect(result.distributedAmount).toBe(120);
		expect(result.remainingAmount).toBe(0);
	});

	it("throws an error when the participant does not exist", async () => {
		prismaMock.fundraiserParticipant.findUnique.mockResolvedValue(null);

		await expect(
			getParticipantFinancialSummary("missing-participant"),
		).rejects.toThrow("Fundraiser participant not found");

		expect(prismaMock.fundraiserAllocation.findMany).not.toHaveBeenCalled();
	});
});
