import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiser: {
			findUnique: vi.fn(),
		},
		fundraiserContribution: {
			create: vi.fn(),
			findUnique: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	addContribution,
	updateContribution,
	deleteContribution,
} from "@/features/fundraisers/actions/fundraiserContributions";
beforeEach(() => {
	vi.clearAllMocks();
});

describe("addContribution", () => {
	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(
			addContribution({
				fundraiserId: "missing-fundraiser",
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
				date: "2026-10-09",
			}),
		).rejects.toThrow("Fundraiser not found");

		expect(prismaMock.fundraiserContribution.create).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser is completed", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		await expect(
			addContribution({
				fundraiserId: "fundraiser-1",
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
				date: "2026-10-09",
			}),
		).rejects.toThrow("Completed Fundraisers cannot be edited");

		expect(prismaMock.fundraiserContribution.create).not.toHaveBeenCalled();
	});

	it("adds a contribution successfully", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		await addContribution({
			fundraiserId: "fundraiser-1",
			amount: 100,
			paymentMethod: "CASH",
			source: "DONATION",
			date: "2026-10-09",
			description: "Fundraiser donation",
		});

		expect(prismaMock.fundraiserContribution.create).toHaveBeenCalledWith({
			data: {
				fundraiserId: "fundraiser-1",
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
				date: new Date("2026-10-09"),
				description: "Fundraiser donation",
			},
		});
	});
});

describe("updateContribution", () => {
	it("throws an error when the contribution does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue(null);

		await expect(
			updateContribution("missing-contribution", {
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
				date: "2026-10-09",
			}),
		).rejects.toThrow("Contribution not found");

		expect(prismaMock.fundraiser.findUnique).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser is completed", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "fundraiser-1",
		});

		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		await expect(
			updateContribution("contribution-1", {
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
				date: "2026-10-09",
			}),
		).rejects.toThrow("Completed Fundraisers cannot be edited");

		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "missing-fundraiser",
		});

		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(
			updateContribution("contribution-1", {
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
				date: "2026-10-09",
			}),
		).rejects.toThrow("Fundraiser not found");

		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
	});

	it("updates a contribution successfully", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "fundraiser-1",
		});
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		await updateContribution("contribution-1", {
			amount: 150,
			paymentMethod: "CASH",
			source: "DONATION",
			date: "2026-10-09",
			description: "Updated donation",
		});

		expect(prismaMock.fundraiserContribution.update).toHaveBeenCalledWith({
			where: { id: "contribution-1" },
			data: {
				amount: 150,
				paymentMethod: "CASH",
				source: "DONATION",
				date: new Date("2026-10-09"),
				description: "Updated donation",
			},
		});
	});
});

describe("deleteContribution", () => {
	it("throws an error when the contribution does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue(null);

		await expect(deleteContribution("missing-contribution")).rejects.toThrow(
			"Contribution not found",
		);

		expect(prismaMock.fundraiser.findUnique).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser is completed", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "fundraiser-1",
		});
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		await expect(deleteContribution("contribution-1")).rejects.toThrow(
			"Completed Fundraisers cannot be edited",
		);

		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "missing-fundraiser",
		});
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(deleteContribution("contribution-1")).rejects.toThrow(
			"Fundraiser not found",
		);

		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});

	it("deletes a contribution successfully", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "fundraiser-1",
		});
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		await deleteContribution("contribution-1");

		expect(prismaMock.fundraiserContribution.delete).toHaveBeenCalledWith({
			where: { id: "contribution-1" },
		});
	});
});
