import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiser: {
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			findUnique: vi.fn(),
		},
		fundraiserContribution: {
			aggregate: vi.fn(),
		},
		fundraiserAllocation: {
			aggregate: vi.fn(),
		},
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	createFundraiser,
	updateFundraiser,
	deleteFundraiser,
	changeCompletedStatus,
	changePublishStatus,
} from "@/features/fundraisers/actions/fundraisers";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("createFundraiser", () => {
	it("creates a fundraiser with the provided data", async () => {
		const data = {
			name: "Cookie Sale",
			description: "Annual fundraiser",
			startDate: new Date("2026-10-09"),
		};

		const fundraiser = {
			id: "fundraiser-1",
			...data,
			isCompleted: false,
			isPublished: false,
		};

		prismaMock.fundraiser.create.mockResolvedValue(fundraiser);

		const result = await createFundraiser(data as never);

		expect(prismaMock.fundraiser.create).toHaveBeenCalledWith({ data });
		expect(result).toEqual(fundraiser);
	});
});

describe("updateFundraiser", () => {
	it("updates a fundraiser with the provided data", async () => {
		const data = {
			name: "Updated Cookie Sale",
			description: "Updated fundraiser",
			startDate: new Date("2026-11-01"),
		};

		const fundraiser = {
			id: "fundraiser-1",
			...data,
			isCompleted: false,
			isPublished: false,
		};

		prismaMock.fundraiser.update.mockResolvedValue(fundraiser);

		const result = await updateFundraiser("fundraiser-1", data as never);

		expect(prismaMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data,
		});

		expect(result).toEqual(fundraiser);
	});
});

describe("deleteFundraiser", () => {
	it("deletes the fundraiser with the specified ID", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			name: "Cookie Sale",
		};

		prismaMock.fundraiser.delete.mockResolvedValue(fundraiser);

		const result = await deleteFundraiser("fundraiser-1");

		expect(prismaMock.fundraiser.delete).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
		});

		expect(result).toEqual(fundraiser);
	});
});

describe("changeCompletedStatus", () => {
	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(changeCompletedStatus("missing-fundraiser")).rejects.toThrow(
			"Fundraiser not found",
		);

		expect(prismaMock.fundraiserContribution.aggregate).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserAllocation.aggregate).not.toHaveBeenCalled();
		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("throws an error when funds remain unallocated", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
		});

		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: 75 },
		});

		await expect(changeCompletedStatus("fundraiser-1")).rejects.toThrow(
			"$25.00 still needs to be allocated before completing the fundraiser",
		);

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("throws an error when allocations exceed the amount raised", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
		});

		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: 125 },
		});

		await expect(changeCompletedStatus("fundraiser-1")).rejects.toThrow(
			"Allocations exceed the amount raised by $25.00.",
		);

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("completes a fundraiser when all funds are allocated", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			isCompleted: true,
		};

		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
		});

		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		prismaMock.fundraiser.update.mockResolvedValue(fundraiser);

		const result = await changeCompletedStatus("fundraiser-1");

		expect(prismaMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isCompleted: true },
		});

		expect(result).toEqual(fundraiser);
	});

	it("completes a fundraiser when no funds have been raised or allocated", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			isCompleted: true,
		};

		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
		});

		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: null },
		});

		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: null },
		});

		prismaMock.fundraiser.update.mockResolvedValue(fundraiser);

		const result = await changeCompletedStatus("fundraiser-1");

		expect(prismaMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isCompleted: true },
		});

		expect(result).toEqual(fundraiser);
	});

	it("reverts a completed fundraiser to incomplete", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			isCompleted: false,
		};

		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: true,
		});

		prismaMock.fundraiser.update.mockResolvedValue(fundraiser);

		const result = await changeCompletedStatus("fundraiser-1");

		expect(prismaMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isCompleted: false },
		});

		expect(prismaMock.fundraiserContribution.aggregate).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserAllocation.aggregate).not.toHaveBeenCalled();
		expect(result).toEqual(fundraiser);
	});

	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(changePublishStatus("fundraiser-1")).rejects.toThrow(
			"Fundraiser not found",
		);

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("unpublishes a published fundraiser", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			isPublished: false,
		};

		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isPublished: true,
		});

		prismaMock.fundraiser.update.mockResolvedValue(fundraiser);

		const result = await changePublishStatus("fundraiser-1");

		expect(prismaMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isPublished: false },
		});

		expect(result).toEqual(fundraiser);
	});
});
