import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { asAdminParent, asParent, expectRedirect } from "@/test/helpers/auth";

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
			fundraiser: {
				findUnique: vi.fn(),
			},
			fundraiserParticipant: {
				findUnique: vi.fn(),
				count: vi.fn(),
			},
			fundraiserContribution: {
				aggregate: vi.fn(),
			},
			fundraiserAllocation: {
				findMany: vi.fn(),
				aggregate: vi.fn(),
			},
		},
	};
});

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { setCustomDistribution } from "@/features/fundraisers/actions/set-custom-distribution";
import { getActiveFundraiserAllocations } from "@/features/fundraisers/data/get-active-fundraiser-allocations";
import { getParticipantFinancialSummary } from "@/features/fundraisers/data/get-participant-financial-summary";
import { getFundraiserFinancialSummary } from "@/features/fundraisers/data/get-fundraiser-financial-summary";

const dec = (value: string | number) => new Prisma.Decimal(value);

// create() is called with a Decimal amount; compare by value
function createdAllocations() {
	return transactionMock.fundraiserAllocation.create.mock.calls.map(
		([args]) => ({
			participantId: args.data.fundraiserParticipantId,
			amount: args.data.amount.toFixed(2),
			status: args.data.status,
		}),
	);
}

describe("setCustomDistribution", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		prismaMock.$transaction.mockImplementation(
			async (callback: (tx: typeof transactionMock) => unknown) => {
				return callback(transactionMock);
			},
		);

		transactionMock.fundraiser.findUnique.mockResolvedValue({
			status: "DRAFT",
		});

		transactionMock.fundraiserParticipant.findMany.mockResolvedValue([
			{ id: "participant-1" },
			{ id: "participant-2" },
		]);

		transactionMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: dec("100") },
		});

		transactionMock.fundraiserAllocation.findMany.mockResolvedValue([]);
	});

	it("returns an error when allocations do not equal the total raised", async () => {
		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 40 },
			{ participantId: "participant-2", amount: 50 },
		]);

		expect(result).toEqual({
			ok: false,
			error: "Total allocation of 90.00 does not match total raised of 100.00",
		});
		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("returns an error for a completed fundraiser and changes nothing", async () => {
		transactionMock.fundraiser.findUnique.mockResolvedValue({
			status: "COMPLETED",
		});

		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 50 },
			{ participantId: "participant-2", amount: 50 },
		]);

		expect(result).toEqual({
			ok: false,
			error: "Completed fundraisers cannot be edited.",
		});
		expect(
			transactionMock.fundraiserAllocation.findMany,
		).not.toHaveBeenCalled();
		expect(
			transactionMock.fundraiserAllocation.updateMany,
		).not.toHaveBeenCalled();
		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("returns an error for negative allocation amounts", async () => {
		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 110 },
			{ participantId: "participant-2", amount: -10 },
		]);

		expect(result).toEqual({
			ok: false,
			error:
				"Allocation amount for participant participant-2 cannot be negative",
		});
		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("returns an error for amounts that are not valid numbers", async () => {
		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: Number.NaN },
			{ participantId: "participant-2", amount: 100 },
		]);

		expect(result).toEqual({
			ok: false,
			error:
				"Allocation amount for participant participant-1 is not a valid number",
		});
		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("returns an error when a participant is submitted twice", async () => {
		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 50 },
			{ participantId: "participant-1", amount: 50 },
		]);

		expect(result).toEqual({
			ok: false,
			error: "Participant participant-1 was submitted more than once",
		});
		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("returns an error for participants who do not belong to the fundraiser", async () => {
		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 100 },
			{ participantId: "wrong-participant", amount: 0 },
		]);

		expect(result).toEqual({
			ok: false,
			error:
				"Participant wrong-participant does not belong to fundraiser fundraiser-1",
		});
		expect(transactionMock.fundraiserAllocation.create).not.toHaveBeenCalled();
	});

	it("creates a $0 allocation for a participant entered as zero", async () => {
		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 100 },
			{ participantId: "participant-2", amount: 0 },
		]);

		expect(result.ok).toBe(true);
		expect(createdAllocations()).toEqual([
			{ participantId: "participant-1", amount: "100.00", status: "ACTIVE" },
			{ participantId: "participant-2", amount: "0.00", status: "ACTIVE" },
		]);
	});

	it("gives participants left out of the request a $0 allocation", async () => {
		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 100 },
		]);

		expect(result).toEqual({
			ok: true,
			data: [
				{ participantId: "participant-1", amount: 100 },
				{ participantId: "participant-2", amount: 0 },
			],
		});
		expect(createdAllocations()).toEqual([
			{ participantId: "participant-1", amount: "100.00", status: "ACTIVE" },
			{ participantId: "participant-2", amount: "0.00", status: "ACTIVE" },
		]);
	});

	it("rounds amounts to cents", async () => {
		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 33.333 },
			{ participantId: "participant-2", amount: 66.667 },
		]);

		expect(result.ok).toBe(true);
		expect(createdAllocations()).toEqual([
			{ participantId: "participant-1", amount: "33.33", status: "ACTIVE" },
			{ participantId: "participant-2", amount: "66.67", status: "ACTIVE" },
		]);
	});

	it("compares totals exactly (0.1 + 0.2 equals 0.3)", async () => {
		transactionMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: dec("0.3") },
		});

		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 0.1 },
			{ participantId: "participant-2", amount: 0.2 },
		]);

		expect(result.ok).toBe(true);
	});

	it("does not recreate allocations whose amount is unchanged", async () => {
		transactionMock.fundraiserAllocation.findMany.mockResolvedValue([
			{
				id: "allocation-1",
				fundraiserParticipantId: "participant-1",
				amount: dec("100"),
			},
			{
				id: "allocation-2",
				fundraiserParticipantId: "participant-2",
				amount: dec("0"),
			},
		]);

		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 100 },
			{ participantId: "participant-2", amount: 0 },
		]);

		expect(result.ok).toBe(true);
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
				amount: dec("80"),
			},
			{
				id: "allocation-2",
				fundraiserParticipantId: "participant-2",
				amount: dec("0"),
			},
		]);

		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 100 },
			{ participantId: "participant-2", amount: 0 },
		]);

		expect(result.ok).toBe(true);
		expect(
			transactionMock.fundraiserAllocation.updateMany,
		).toHaveBeenCalledTimes(1);
		expect(
			transactionMock.fundraiserAllocation.updateMany,
		).toHaveBeenCalledWith({
			where: { id: { in: ["allocation-1"] } },
			data: { status: "VOID" },
		});
		expect(createdAllocations()).toEqual([
			{ participantId: "participant-1", amount: "100.00", status: "ACTIVE" },
		]);
	});

	it("replaces an allocation with a $0 allocation when set to zero", async () => {
		transactionMock.fundraiserAllocation.findMany.mockResolvedValue([
			{
				id: "allocation-1",
				fundraiserParticipantId: "participant-1",
				amount: dec("100"),
			},
		]);

		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 0 },
			{ participantId: "participant-2", amount: 100 },
		]);

		expect(result.ok).toBe(true);
		expect(
			transactionMock.fundraiserAllocation.updateMany,
		).toHaveBeenCalledWith({
			where: { id: { in: ["allocation-1"] } },
			data: { status: "VOID" },
		});
		expect(createdAllocations()).toEqual([
			{ participantId: "participant-1", amount: "0.00", status: "ACTIVE" },
			{ participantId: "participant-2", amount: "100.00", status: "ACTIVE" },
		]);
	});

	it("collapses duplicate active allocations into one", async () => {
		transactionMock.fundraiserAllocation.findMany.mockResolvedValue([
			{
				id: "allocation-1",
				fundraiserParticipantId: "participant-1",
				amount: dec("50"),
			},
			{
				id: "allocation-2",
				fundraiserParticipantId: "participant-1",
				amount: dec("50"),
			},
		]);

		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 100 },
			{ participantId: "participant-2", amount: 0 },
		]);

		expect(result.ok).toBe(true);
		expect(
			transactionMock.fundraiserAllocation.updateMany,
		).toHaveBeenCalledWith({
			where: { id: { in: ["allocation-1", "allocation-2"] } },
			data: { status: "VOID" },
		});
		expect(createdAllocations()).toEqual([
			{ participantId: "participant-1", amount: "100.00", status: "ACTIVE" },
			{ participantId: "participant-2", amount: "0.00", status: "ACTIVE" },
		]);
	});

	it("returns an error for a fundraiser that does not exist", async () => {
		transactionMock.fundraiser.findUnique.mockResolvedValue(null);

		const result = await setCustomDistribution("missing-fundraiser", [
			{ participantId: "participant-1", amount: 100 },
		]);

		expect(result).toEqual({ ok: false, error: "Fundraiser not found" });
		expect(
			transactionMock.fundraiserParticipant.findMany,
		).not.toHaveBeenCalled();
	});

	it("returns an error for a fundraiser with no participants", async () => {
		transactionMock.fundraiserParticipant.findMany.mockResolvedValue([]);

		const result = await setCustomDistribution("fundraiser-1", []);

		expect(result).toEqual({ ok: false, error: "No participants found" });
		expect(
			transactionMock.fundraiserContribution.aggregate,
		).not.toHaveBeenCalled();
	});

	it("returns the saved distribution when it is valid", async () => {
		const allocations = [
			{ participantId: "participant-1", amount: 60 },
			{ participantId: "participant-2", amount: 40 },
		];

		const result = await setCustomDistribution("fundraiser-1", allocations);

		expect(result).toEqual({ ok: true, data: allocations });
	});

	it("treats null total contributions as zero", async () => {
		transactionMock.fundraiserParticipant.findMany.mockResolvedValue([
			{ id: "participant-1" },
		]);
		transactionMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: null },
		});

		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 0 },
		]);

		expect(result).toEqual({
			ok: true,
			data: [{ participantId: "participant-1", amount: 0 }],
		});
		expect(createdAllocations()).toEqual([
			{ participantId: "participant-1", amount: "0.00", status: "ACTIVE" },
		]);
	});

	it("redirects a PARENT without touching the database", async () => {
		asParent();

		await expectRedirect(() =>
			setCustomDistribution("fundraiser-1", [
				{ participantId: "participant-1", amount: 100 },
			]),
		);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("allows an ADMIN_PARENT", async () => {
		asAdminParent();

		const result = await setCustomDistribution("fundraiser-1", [
			{ participantId: "participant-1", amount: 60 },
			{ participantId: "participant-2", amount: 40 },
		]);

		expect(result.ok).toBe(true);
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
				amount: dec("75.50"),
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

	it("redirects a PARENT without touching the database", async () => {
		asParent();

		await expectRedirect(() => getActiveFundraiserAllocations("fundraiser-1"));

		expect(prismaMock.fundraiserAllocation.findMany).not.toHaveBeenCalled();
	});
});

describe("getParticipantFinancialSummary", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("counts only PUBLISHED distributions as distributed", async () => {
		prismaMock.fundraiserParticipant.findUnique.mockResolvedValue({
			id: "participant-1",
			player: { id: "player-1" },
		});

		prismaMock.fundraiserAllocation.findMany.mockResolvedValue([
			{
				id: "allocation-1",
				amount: dec("100.00"),
				transactions: [{ amount: dec("30.00") }],
			},
		]);

		await expect(
			getParticipantFinancialSummary("participant-1"),
		).resolves.toMatchObject({
			allocationAmount: 100,
			distributedAmount: 30,
			remainingAmount: 70,
		});

		expect(prismaMock.fundraiserAllocation.findMany).toHaveBeenCalledWith({
			where: {
				fundraiserParticipantId: "participant-1",
				status: "ACTIVE",
			},
			include: {
				transactions: {
					where: {
						type: "DISTRIBUTION",
						status: "PUBLISHED",
					},
					select: { amount: true },
				},
			},
		});
	});

	it("returns zeros when the participant has no allocations", async () => {
		prismaMock.fundraiserParticipant.findUnique.mockResolvedValue({
			id: "participant-1",
			player: { id: "player-1" },
		});
		prismaMock.fundraiserAllocation.findMany.mockResolvedValue([]);

		await expect(
			getParticipantFinancialSummary("participant-1"),
		).resolves.toMatchObject({
			allocationAmount: 0,
			distributedAmount: 0,
			remainingAmount: 0,
		});
	});

	it("throws an error when the participant does not exist", async () => {
		prismaMock.fundraiserParticipant.findUnique.mockResolvedValue(null);

		await expect(
			getParticipantFinancialSummary("missing-participant"),
		).rejects.toThrow("Fundraiser participant not found");

		expect(prismaMock.fundraiserAllocation.findMany).not.toHaveBeenCalled();
	});
});

describe("getFundraiserFinancialSummary", () => {
	beforeEach(() => {
		vi.clearAllMocks();
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

	it("calculates the fundraiser's financial summary", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
		});
		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: dec("250.00") },
		});
		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: dec("175.00") },
		});
		prismaMock.fundraiserParticipant.count.mockResolvedValue(5);

		await expect(
			getFundraiserFinancialSummary("fundraiser-1"),
		).resolves.toEqual({
			totalRaised: 250,
			currentlyAllocated: 175,
			availableToAllocate: 75,
			participantCount: 5,
		});

		expect(prismaMock.fundraiserAllocation.aggregate).toHaveBeenCalledWith({
			where: {
				fundraiserParticipant: { fundraiserId: "fundraiser-1" },
				status: "ACTIVE",
			},
			_sum: { amount: true },
		});
	});

	it("never reports a negative amount available to allocate", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
		});
		prismaMock.fundraiserContribution.aggregate.mockResolvedValue({
			_sum: { amount: dec("100.00") },
		});
		prismaMock.fundraiserAllocation.aggregate.mockResolvedValue({
			_sum: { amount: dec("120.00") },
		});
		prismaMock.fundraiserParticipant.count.mockResolvedValue(2);

		await expect(
			getFundraiserFinancialSummary("fundraiser-1"),
		).resolves.toMatchObject({ availableToAllocate: 0 });
	});

	it("treats null contribution and allocation totals as zero", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
		});
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

	it("redirects a PARENT without touching the database", async () => {
		asParent();

		await expectRedirect(() => getFundraiserFinancialSummary("fundraiser-1"));

		expect(prismaMock.fundraiser.findUnique).not.toHaveBeenCalled();
	});
});
