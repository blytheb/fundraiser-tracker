import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiser: {
			findUnique: vi.fn(),
		},
		fundraiserContribution: {
			aggregate: vi.fn(),
		},
		fundraiserAllocation: {
			aggregate: vi.fn(),
		},
		fundraiserParticipant: {
			count: vi.fn(),
		},
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { getFundraiserFinancialSummary } from "@/features/fundraisers/actions/fundraiserAllocation";

describe("getFundraiserFinancialSummary", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
		});

		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: 60 },
		});

		prismaMock.fundraiserParticipant.count.mockResolvedValue(4);
	});

	it("returns the correct financial totals", async () => {
		await expect(
			getFundraiserFinancialSummary("fundraiser-1"),
		).resolves.toEqual({
			totalRaised: 100,
			currentlyAllocated: 60,
			availableToAllocate: 40,
			participantCount: 4,
		});
	});

	it("returns zero totals when no money has been raised or allocated", async () => {
		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: null },
		});

		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: null },
		});

		prismaMock.fundraiserParticipant.count.mockResolvedValue(0);

		await expect(
			getFundraiserFinancialSummary("fundraiser-1"),
		).resolves.toEqual({
			totalRaised: 0,
			currentlyAllocated: 0,
			availableToAllocate: 0,
			participantCount: 0,
		});
	});

	it("never returns negative available funds", async () => {
		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: 120 },
		});

		await expect(
			getFundraiserFinancialSummary("fundraiser-1"),
		).resolves.toEqual({
			totalRaised: 100,
			currentlyAllocated: 120,
			availableToAllocate: 0,
			participantCount: 4,
		});
	});

	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(
			getFundraiserFinancialSummary("missing-fundraiser"),
		).rejects.toThrow("Fundraiser not found");

		expect(prismaMock.fundraiserContribution.aggregate).not.toHaveBeenCalled();

		expect(prismaMock.fundraiserAllocation.aggregate).not.toHaveBeenCalled();

		expect(prismaMock.fundraiserParticipant.count).not.toHaveBeenCalled();
	});
});
