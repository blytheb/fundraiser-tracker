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

import { Prisma } from "@prisma/client";
import { asParent, expectRedirect } from "../../helpers/auth";
import { getFundraiserFinancialSummary } from "@/features/fundraisers/data/get-fundraiser-financial-summary";

describe("getFundraiserFinancialSummary", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
		});

		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: new Prisma.Decimal(100) },
		});

		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: new Prisma.Decimal(60) },
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
			_sum: { amount: new Prisma.Decimal(100) },
		});

		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: new Prisma.Decimal(120) },
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

	it("keeps cents exact (no floating point drift)", async () => {
		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: new Prisma.Decimal("0.3") },
		});
		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: new Prisma.Decimal("0.1") },
		});

		const summary = await getFundraiserFinancialSummary("fundraiser-1");

		// 0.3 - 0.1 is 0.19999999999999998 with plain numbers
		expect(summary.availableToAllocate).toBe(0.2);
	});

	it("redirects parents", async () => {
		asParent();

		await expectRedirect(() => getFundraiserFinancialSummary("fundraiser-1"));
		expect(prismaMock.fundraiser.findUnique).not.toHaveBeenCalled();
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
