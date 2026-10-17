import { beforeEach, describe, expect, it, vi } from "vitest";

const { txMock, prismaMock } = vi.hoisted(() => {
	const txMock = {
		fundraiser: {
			findUnique: vi.fn(),
			update: vi.fn(),
		},
		playerTransaction: {
			createMany: vi.fn(),
			updateMany: vi.fn(),
		},
		fundraiserContribution: {
			aggregate: vi.fn(),
		},
		fundraiserAllocation: {
			aggregate: vi.fn(),
		},
	};

	return {
		txMock,
		prismaMock: {
			$transaction: vi.fn(),
			fundraiser: {
				findUnique: vi.fn(),
				update: vi.fn(),
			},
			playerTransaction: {
				createMany: vi.fn(),
			},
		},
	};
});

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	publishFundraiser,
	unpublishFundraiser,
	completeFundraiser,
	incompleteFundraiser,
} from "@/features/fundraisers/actions/fundraiserPublishing";

beforeEach(() => {
	vi.clearAllMocks();

	prismaMock.$transaction.mockImplementation(async (callback) =>
		callback(txMock),
	);

	txMock.fundraiserContribution.aggregate.mockResolvedValue({
		_sum: { amount: 100 },
	});

	txMock.fundraiserAllocation.aggregate.mockResolvedValue({
		_sum: { amount: 100 },
	});
});

describe("publishFundraiser", () => {
	it("throws an error when the fundraiser does not exist", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(publishFundraiser("missing-fundraiser")).rejects.toThrow(
			"Fundraiser not found",
		);

		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser is already published", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
			isPublished: true,
			participants: [{ id: "participant-1" }],
		});

		await expect(publishFundraiser("fundraiser-1")).rejects.toThrow(
			"Fundraiser is already published",
		);

		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser has no participants", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
			isPublished: false,
			participants: [],
		});

		await expect(publishFundraiser("fundraiser-1")).rejects.toThrow(
			"A fundraiser must have at least one participant",
		);

		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("publishes a fundraiser with participants", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
			isPublished: false,
			participants: [{ id: "participant-1" }],
		});

		txMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isPublished: true,
		});

		const result = await publishFundraiser("fundraiser-1");

		expect(txMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isPublished: true },
		});

		expect(result).toEqual({ success: true });
	});
});

describe("unpublishFundraiser", () => {
	it("throws an error when the fundraiser does not exist", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(unpublishFundraiser("missing-fundraiser")).rejects.toThrow(
			"Fundraiser not found",
		);

		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
	});
	it("throws an error when the fundraiser is already unpublished", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isPublished: false,
		});

		await expect(unpublishFundraiser("fundraiser-1")).rejects.toThrow(
			"Fundraiser is already unpublished",
		);

		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("unpublishes a fundraiser successfully", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isPublished: true,
		});

		txMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isPublished: false,
		});

		const result = await unpublishFundraiser("fundraiser-1");

		expect(txMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isPublished: false },
		});

		expect(result).toEqual({ success: true });
		expect(txMock.playerTransaction.updateMany).not.toHaveBeenCalled();
		expect(txMock.playerTransaction.createMany).not.toHaveBeenCalled();
		expect(txMock.fundraiserAllocation.aggregate).not.toHaveBeenCalled();
	});
	it("unpublishes a completed fundraiser without voiding distributions", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isPublished: true,
			isCompleted: true,
		});

		txMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isPublished: false,
			isCompleted: true,
		});

		const result = await unpublishFundraiser("fundraiser-1");

		expect(txMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isPublished: false },
		});

		expect(txMock.playerTransaction.updateMany).not.toHaveBeenCalled();
		expect(result).toEqual({ success: true });
	});
});

describe("completeFundraiser", () => {
	it("throws an error when the fundraiser does not exist", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(completeFundraiser("missing-fundraiser")).rejects.toThrow(
			"Fundraiser not found",
		);
	});
	it("throws an error when the fundraiser is already completed", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		await expect(completeFundraiser("fundraiser-1")).rejects.toThrow(
			"Fundraiser is already completed",
		);

		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("throws an error when funds remain unallocated", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
			participants: [],
		});

		txMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: 75 },
		});

		await expect(completeFundraiser("fundraiser-1")).rejects.toThrow(
			"All funds must be allocated before completing",
		);

		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("completes a fundraiser successfully", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
			participants: [
				{
					playerId: "player-1",
					allocations: [
						{
							id: "allocation-1",
							amount: 100,
						},
					],
				},
				{
					playerId: "player-2",
					allocations: [],
				},
			],
		});

		txMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: true,
		});
		const result = await completeFundraiser("fundraiser-1");

		expect(txMock.fundraiser.update).not.toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					isPublished: expect.anything(),
				}),
			}),
		);

		expect(txMock.playerTransaction.createMany).toHaveBeenCalledWith({
			data: [
				{
					playerId: "player-1",
					fundraiserId: "fundraiser-1",
					allocationId: "allocation-1",
					amount: 100,
					type: "DISTRIBUTION",
					description: "Fundraiser distribution",
				},
			],
		});

		expect(txMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isCompleted: true },
		});

		expect(result).toEqual({
			id: "fundraiser-1",
			isCompleted: true,
		});
	});

	it("completes when a participant has no allocation and creates transactions only for allocated participants", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
			participants: [
				{
					playerId: "player-1",
					allocations: [
						{
							id: "allocation-1",
							amount: 100,
						},
					],
				},
				{
					playerId: "player-2",
					allocations: [],
				},
			],
		});

		txMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: true,
		});

		await completeFundraiser("fundraiser-1");

		expect(txMock.playerTransaction.createMany).toHaveBeenCalledWith({
			data: [
				{
					playerId: "player-1",
					fundraiserId: "fundraiser-1",
					allocationId: "allocation-1",
					amount: 100,
					type: "DISTRIBUTION",
					description: "Fundraiser distribution",
				},
			],
		});
	});
	it("throws an error when allocations exceed funds raised", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
			participants: [],
		});

		txMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		txMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: 120 },
		});

		await expect(completeFundraiser("fundraiser-1")).rejects.toThrow(
			"Allocated funds cannot exceed funds raised",
		);

		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
		expect(txMock.playerTransaction.createMany).not.toHaveBeenCalled();
	});

	it("completes a fundraiser with zero funds and creates no transactions", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
			participants: [
				{
					playerId: "player-1",
					allocations: [],
				},
			],
		});

		txMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 0 },
		});

		txMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: 0 },
		});

		txMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: true,
		});

		const result = await completeFundraiser("fundraiser-1");

		expect(txMock.playerTransaction.createMany).not.toHaveBeenCalled();

		expect(txMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isCompleted: true },
		});

		expect(result).toEqual({
			id: "fundraiser-1",
			isCompleted: true,
		});
	});
	it("creates a new distribution transaction when completing again after a previous distribution was voided", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
			participants: [
				{
					playerId: "player-1",
					allocations: [
						{
							id: "allocation-1",
							amount: 100,
						},
					],
				},
			],
		});

		txMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		txMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		txMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: true,
		});

		await completeFundraiser("fundraiser-1");

		expect(txMock.playerTransaction.createMany).toHaveBeenCalledWith({
			data: [
				{
					playerId: "player-1",
					fundraiserId: "fundraiser-1",
					allocationId: "allocation-1",
					amount: 100,
					type: "DISTRIBUTION",
					description: "Fundraiser distribution",
				},
			],
		});
	});
});

describe("incompleteFundraiser", () => {
	it("throws an error when the fundraiser does not exist", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(incompleteFundraiser("missing-fundraiser")).rejects.toThrow(
			"Fundraiser not found",
		);

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});
	it("throws an error when the fundraiser is already in incomplete mode", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		await expect(incompleteFundraiser("fundraiser-1")).rejects.toThrow(
			"Fundraiser is already in draft mode",
		);

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("returns a completed fundraiser to incomplete mode", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		txMock.playerTransaction.updateMany.mockResolvedValue({
			count: 2,
		});

		txMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
			isPublished: false,
		});

		const result = await incompleteFundraiser("fundraiser-1");

		expect(txMock.playerTransaction.updateMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
				status: "ACTIVE",
				type: "DISTRIBUTION",
			},
			data: {
				status: "VOID",
			},
		});

		expect(txMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: {
				isCompleted: false,
				isPublished: false,
			},
		});

		expect(result).toEqual({
			id: "fundraiser-1",
			isCompleted: false,
			isPublished: false,
		});
	});

	it("returns a completed fundraiser to incomplete mode when no transactions exist", async () => {
		txMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		txMock.playerTransaction.updateMany.mockResolvedValue({
			count: 0,
		});

		txMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
			isPublished: false,
		});

		const result = await incompleteFundraiser("fundraiser-1");

		expect(txMock.playerTransaction.updateMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
				status: "ACTIVE",
				type: "DISTRIBUTION",
			},
			data: {
				status: "VOID",
			},
		});

		expect(txMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: {
				isCompleted: false,
				isPublished: false,
			},
		});

		expect(result).toEqual({
			id: "fundraiser-1",
			isCompleted: false,
			isPublished: false,
		});
	});
});
