import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiserContribution: {
			findMany: vi.fn(),
		},
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { getFundraiserContributions } from "@/features/fundraisers/data/fundraiserContributions";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getFundraiserContributions", () => {
	it("retrieves contributions for the specified fundraiser", async () => {
		prismaMock.fundraiserContribution.findMany.mockResolvedValue([]);

		await getFundraiserContributions("fundraiser-1");

		expect(prismaMock.fundraiserContribution.findMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
			},
			orderBy: {
				date: "desc",
			},
		});
	});

	it("converts contribution amounts to numbers", async () => {
		prismaMock.fundraiserContribution.findMany.mockResolvedValue([
			{
				id: "contribution-1",
				fundraiserId: "fundraiser-1",
				amount: { toString: () => "125.50" },
				date: new Date("2026-10-09"),
			},
		] as never);

		const result = await getFundraiserContributions("fundraiser-1");

		expect(result[0].amount).toBe(125.5);
		expect(typeof result[0].amount).toBe("number");
	});

	it("preserves contribution fields while converting the amount", async () => {
		const contributionDate = new Date("2026-10-09");

		prismaMock.fundraiserContribution.findMany.mockResolvedValue([
			{
				id: "contribution-1",
				fundraiserId: "fundraiser-1",
				amount: { toString: () => "200.00" },
				paymentMethod: "CASH",
				source: "DONATION",
				date: contributionDate,
				description: "Bake sale donation",
				createdAt: contributionDate,
				updatedAt: contributionDate,
			},
		] as never);

		const result = await getFundraiserContributions("fundraiser-1");

		expect(result).toEqual([
			{
				id: "contribution-1",
				fundraiserId: "fundraiser-1",
				amount: 200,
				paymentMethod: "CASH",
				source: "DONATION",
				date: contributionDate,
				description: "Bake sale donation",
				createdAt: contributionDate,
				updatedAt: contributionDate,
			},
		]);
	});

	it("returns an empty array when no contributions exist", async () => {
		prismaMock.fundraiserContribution.findMany.mockResolvedValue([]);

		const result = await getFundraiserContributions("fundraiser-1");

		expect(result).toEqual([]);
	});
});
