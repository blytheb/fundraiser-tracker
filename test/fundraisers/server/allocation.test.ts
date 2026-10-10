import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, transactionMock } = vi.hoisted(() => {
	const transactionMock = {
		fundraiser: {
			findUnique: vi.fn(),
		},
		fundraiserParticipant: {
			findMany: vi.fn(),
		},
		fundraiserContribution: {
			aggregate: vi.fn(),
		},
		fundraiserAllocation: {
			findMany: vi.fn(),
			updateMany: vi.fn(),
			create: vi.fn(),
		},
	};

	return {
		transactionMock,
		prismaMock: {
			$transaction: vi.fn(),
			fundraiserAllocation: {
				findMany: vi.fn(),
			},
		},
	};
});

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	setCustomDistribution,
	getActiveFundraiserAllocations,
} from "@/features/fundraisers/actions/fundraiserAllocation";

describe("setCustomDistribution", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		prismaMock.$transaction.mockImplementation(
			async (callback: (tx: typeof transactionMock) => unknown) => {
				return callback(transactionMock);
			},
		);

		transactionMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		transactionMock.fundraiserParticipant.findMany.mockResolvedValue([
			{ id: "participant-1" },
			{ id: "participant-2" },
		]);

		transactionMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		transactionMock.fundraiserAllocation.findMany.mockResolvedValue([]);
	});

	it("rejects allocations that do not equal the total raised", async () => {
		await expect(
			setCustomDistribution("fundraiser-1", [
				{ participantId: "participant-1", amount: 40 },
				{ participantId: "participant-2", amount: 50 },
			]),
		).rejects.toThrow(/does not match total raised/);

		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("rejects changes to a completed fundraiser", async () => {
		transactionMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		await expect(
			setCustomDistribution("fundraiser-1", [
				{ participantId: "participant-1", amount: 50 },
				{ participantId: "participant-2", amount: 50 },
			]),
		).rejects.toThrow(/Completed fundraisers cannot be edited/);

		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("rejects negative allocation amounts", async () => {
		await expect(
			setCustomDistribution("fundraiser-1", [
				{ participantId: "participant-1", amount: 110 },
				{ participantId: "participant-2", amount: -10 },
			]),
		).rejects.toThrow(/cannot be negative/);

		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("rejects participants who do not belong to the fundraiser", async () => {
		await expect(
			setCustomDistribution("fundraiser-1", [
				{ participantId: "participant-1", amount: 100 },
				{ participantId: "wrong-participant", amount: 0 },
			]),
		).rejects.toThrow(/does not belong to fundraiser/);

		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("does not create an allocation when the amount is zero", async () => {
		await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 100 },
			{ participantId: "participant-2", amount: 0 },
		]);

		expect(transactionMock.fundraiserAllocation.create).toHaveBeenCalledTimes(
			1,
		);

		expect(transactionMock.fundraiserAllocation.create).toHaveBeenCalledWith({
			data: {
				fundraiserParticipantId: "participant-1",
				amount: 100,
				status: "ACTIVE",
			},
		});

		expect(
			transactionMock.fundraiserAllocation.create,
		).not.toHaveBeenCalledWith({
			data: {
				fundraiserParticipantId: "participant-2",
				amount: 0,
				status: "ACTIVE",
			},
		});
	});

	it("does not recreate an allocation when the amount is unchanged", async () => {
		transactionMock.fundraiserAllocation.findMany.mockResolvedValue([
			{
				id: "allocation-1",
				fundraiserParticipantId: "participant-1",
				amount: 100,
			},
		]);

		await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 100 },
			{ participantId: "participant-2", amount: 0 },
		]);

		expect(
			transactionMock.fundraiserAllocation.updateMany,
		).not.toHaveBeenCalled();

		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("voids the old allocation and creates a new one when the amount changes", async () => {
		transactionMock.fundraiserAllocation.findMany.mockResolvedValue([
			{
				id: "allocation-1",
				fundraiserParticipantId: "participant-1",
				amount: 80,
			},
		]);

		await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 100 },
			{ participantId: "participant-2", amount: 0 },
		]);

		expect(
			transactionMock.fundraiserAllocation.updateMany,
		).toHaveBeenCalledWith({
			where: { id: { in: ["allocation-1"] } },
			data: { status: "VOID" },
		});

		expect(transactionMock.fundraiserAllocation.create).toHaveBeenCalledWith({
			data: {
				fundraiserParticipantId: "participant-1",
				amount: 100,
				status: "ACTIVE",
			},
		});
	});

	it("rejects a fundraiser that does not exist", async () => {
		transactionMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(
			setCustomDistribution("missing-fundraiser", [
				{ participantId: "participant-1", amount: 100 },
			]),
		).rejects.toThrow(/Fundraiser not found/);

		expect(
			transactionMock.fundraiserParticipant.findMany,
		).not.toHaveBeenCalled();
	});

	it("rejects a fundraiser with no participants", async () => {
		transactionMock.fundraiserParticipant.findMany.mockResolvedValue([]);

		await expect(setCustomDistribution("fundraiser-1", [])).rejects.toThrow(
			/No participants found/,
		);

		expect(
			transactionMock.fundraiserContribution.aggregate,
		).not.toHaveBeenCalled();
	});

	it("returns the requested distribution when it is valid", async () => {
		const allocations = [
			{ participantId: "participant-1", amount: 60 },
			{ participantId: "participant-2", amount: 40 },
		];

		await expect(
			setCustomDistribution("fundraiser-1", allocations),
		).resolves.toEqual(allocations);
	});

	it("treats null total contributions as zero", async () => {
		transactionMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		transactionMock.fundraiserParticipant.findMany.mockResolvedValue([
			{ id: "participant-1" },
		]);

		transactionMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: null },
		});

		transactionMock.fundraiserAllocation.findMany.mockResolvedValue([]);

		const result = await setCustomDistribution("fundraiser-1", [
			{
				participantId: "participant-1",
				amount: 0,
			},
		]);

		expect(result).toEqual([
			{
				participantId: "participant-1",
				amount: 0,
			},
		]);

		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("creates an allocation when a participant has no existing allocation", async () => {
		transactionMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		transactionMock.fundraiserParticipant.findMany.mockResolvedValue([
			{ id: "participant-1" },
		]);

		transactionMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		transactionMock.fundraiserAllocation.findMany.mockResolvedValue([]);

		const result = await setCustomDistribution("fundraiser-1", [
			{
				participantId: "participant-1",
				amount: 100,
			},
		]);

		expect(result).toEqual([
			{
				participantId: "participant-1",
				amount: 100,
			},
		]);

		expect(transactionMock.fundraiserAllocation.create).toHaveBeenCalledWith({
			data: {
				fundraiserParticipantId: "participant-1",
				amount: 100,
				status: "ACTIVE",
			},
		});
	});

	it("voids an existing allocation without creating a new zero allocation", async () => {
		transactionMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		transactionMock.fundraiserParticipant.findMany.mockResolvedValue([
			{ id: "participant-1" },
			{ id: "participant-2" },
		]);

		transactionMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: 100 },
		});

		transactionMock.fundraiserAllocation.findMany.mockResolvedValue([
			{
				id: "allocation-1",
				fundraiserParticipantId: "participant-1",
				amount: 100,
			},
		]);

		await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 0 },
			{ participantId: "participant-2", amount: 100 },
		]);

		expect(
			transactionMock.fundraiserAllocation.updateMany,
		).toHaveBeenCalledWith({
			where: { id: { in: ["allocation-1"] } },
			data: { status: "VOID" },
		});

		expect(transactionMock.fundraiserAllocation.create).toHaveBeenCalledTimes(
			1,
		);

		expect(transactionMock.fundraiserAllocation.create).toHaveBeenCalledWith({
			data: {
				fundraiserParticipantId: "participant-2",
				amount: 100,
				status: "ACTIVE",
			},
		});
	});
});

describe("getActiveFundraiserAllocations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns active allocations with numeric amounts", async () => {
		prismaMock.fundraiserAllocation.findMany.mockResolvedValue([
			{
				id: "allocation-1",
				fundraiserParticipantId: "participant-1",
				amount: "75.50",
				status: "ACTIVE",
			},
		]);

		await expect(
			getActiveFundraiserAllocations("fundraiser-1"),
		).resolves.toEqual([
			{
				id: "allocation-1",
				fundraiserParticipantId: "participant-1",
				amount: 75.5,
				status: "ACTIVE",
			},
		]);

		expect(prismaMock.fundraiserAllocation.findMany).toHaveBeenCalledWith({
			where: {
				fundraiserParticipant: { fundraiserId: "fundraiser-1" },
				status: "ACTIVE",
			},
			select: {
				id: true,
				fundraiserParticipantId: true,
				amount: true,
				status: true,
			},
		});
	});

	it("returns an empty array when no active allocations exist", async () => {
		prismaMock.fundraiserAllocation.findMany.mockResolvedValue([]);

		await expect(
			getActiveFundraiserAllocations("fundraiser-1"),
		).resolves.toEqual([]);
	});

	it("queries only active allocations for the specified fundraiser", async () => {
		prismaMock.fundraiserAllocation.findMany.mockResolvedValue([]);

		await getActiveFundraiserAllocations("fundraiser-123");

		expect(prismaMock.fundraiserAllocation.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					fundraiserParticipant: {
						fundraiserId: "fundraiser-123",
					},
					status: "ACTIVE",
				},
			}),
		);
	});
});
