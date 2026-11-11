import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { asAdminParent, asParent, expectRedirect } from "@/test/helpers/auth";

const { txMock, prismaMock } = vi.hoisted(() => {
	const txMock = {
		fundraiser: {
			updateMany: vi.fn(),
			findUnique: vi.fn(),
			findUniqueOrThrow: vi.fn(),
		},
		fundraiserParticipant: {
			findMany: vi.fn(),
			count: vi.fn(),
		},
		fundraiserAllocation: {
			createMany: vi.fn(),
		},
		fundraiserContribution: {
			aggregate: vi.fn(),
		},
		playerTransaction: {
			createMany: vi.fn(),
			updateMany: vi.fn(),
		},
	};

	return {
		txMock,
		prismaMock: {
			$transaction: vi.fn(),
		},
	};
});

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { publishFundraiser } from "@/features/fundraisers/actions/publish-fundraiser";
import { completeFundraiser } from "@/features/fundraisers/actions/complete-fundraiser";
import { reopenFundraiser } from "@/features/fundraisers/actions/reopen-fundraiser";
import { unpublishFundraiser } from "@/features/fundraisers/actions/unpublish-fundraiser";

const dec = (value: string | number) => new Prisma.Decimal(value);

type TestParticipant = {
	playerId: string;
	allocations: { id: string; amount: Prisma.Decimal }[];
};

function mockFundraiser(participants: TestParticipant[]) {
	txMock.fundraiser.findUniqueOrThrow.mockResolvedValue({
		id: "fundraiser-1",
		status: "COMPLETED",
		participants,
	});
}

function mockRaised(amount: Prisma.Decimal | null) {
	txMock.fundraiserContribution.aggregate.mockResolvedValue({
		_sum: { amount },
	});
}

beforeEach(() => {
	vi.clearAllMocks();

	prismaMock.$transaction.mockImplementation(async (callback) =>
		callback(txMock),
	);

	// defaults: the status claim succeeds, nobody is missing an allocation
	txMock.fundraiser.updateMany.mockResolvedValue({ count: 1 });
	txMock.fundraiserParticipant.findMany.mockResolvedValue([]);
	txMock.fundraiserParticipant.count.mockResolvedValue(1);
	txMock.playerTransaction.updateMany.mockResolvedValue({ count: 0 });
	txMock.playerTransaction.createMany.mockResolvedValue({ count: 0 });
	mockRaised(dec("100"));
});

describe("completeFundraiser", () => {
	it("claims the DRAFT -> COMPLETED status change first", async () => {
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [{ id: "allocation-1", amount: dec("100") }],
			},
		]);

		const result = await completeFundraiser("fundraiser-1");

		expect(result.ok).toBe(true);
		expect(txMock.fundraiser.updateMany).toHaveBeenCalledWith({
			where: { id: "fundraiser-1", status: { in: ["DRAFT"] } },
			data: { status: "COMPLETED" },
		});
	});

	it("returns an error when the fundraiser does not exist", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue(null);

		const result = await completeFundraiser("missing-fundraiser");

		expect(result).toEqual({ ok: false, error: "Fundraiser not found" });
		expect(txMock.playerTransaction.createMany).not.toHaveBeenCalled();
	});

	it("returns an error when the fundraiser is not a draft", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			status: "COMPLETED",
		});

		const result = await completeFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error:
				"Only draft fundraisers can be completed. This fundraiser is completed.",
		});
		expect(txMock.playerTransaction.createMany).not.toHaveBeenCalled();
	});

	it("returns an error when the fundraiser has no participants", async () => {
		mockFundraiser([]);

		const result = await completeFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error: "A fundraiser must have at least one participant",
		});
	});

	it("gives participants with no allocation a $0 allocation", async () => {
		txMock.fundraiserParticipant.findMany.mockResolvedValue([
			{ id: "participant-2" },
		]);
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [{ id: "allocation-1", amount: dec("100") }],
			},
			{
				playerId: "player-2",
				allocations: [{ id: "allocation-2", amount: dec("0") }],
			},
		]);

		const result = await completeFundraiser("fundraiser-1");

		expect(result.ok).toBe(true);
		expect(txMock.fundraiserParticipant.findMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
				allocations: { none: { status: "ACTIVE" } },
			},
			select: { id: true },
		});

		const createManyArgs =
			txMock.fundraiserAllocation.createMany.mock.calls[0][0];
		expect(createManyArgs.data).toHaveLength(1);
		expect(createManyArgs.data[0]).toMatchObject({
			fundraiserParticipantId: "participant-2",
			status: "ACTIVE",
		});
		expect(createManyArgs.data[0].amount.isZero()).toBe(true);
	});

	it("does not create $0 allocations when everyone already has one", async () => {
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [{ id: "allocation-1", amount: dec("100") }],
			},
		]);

		await completeFundraiser("fundraiser-1");

		expect(txMock.fundraiserAllocation.createMany).not.toHaveBeenCalled();
	});

	it("returns an error when a participant has more than one active allocation", async () => {
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [
					{ id: "allocation-1", amount: dec("50") },
					{ id: "allocation-2", amount: dec("50") },
				],
			},
		]);

		const result = await completeFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error:
				"Each participant must have exactly one allocation before completing",
		});
		expect(txMock.playerTransaction.createMany).not.toHaveBeenCalled();
	});

	it("returns an error when funds remain unallocated", async () => {
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [{ id: "allocation-1", amount: dec("75") }],
			},
		]);

		const result = await completeFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error:
				"All funds must be allocated before completing. Allocated 75.00 of 100.00",
		});
		expect(txMock.playerTransaction.createMany).not.toHaveBeenCalled();
	});

	it("returns an error when allocations exceed funds raised", async () => {
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [{ id: "allocation-1", amount: dec("120") }],
			},
		]);

		const result = await completeFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error:
				"All funds must be allocated before completing. Allocated 120.00 of 100.00",
		});
		expect(txMock.playerTransaction.createMany).not.toHaveBeenCalled();
	});

	it("compares cents exactly (no floating point drift)", async () => {
		mockRaised(dec("0.3"));
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [{ id: "allocation-1", amount: dec("0.1") }],
			},
			{
				playerId: "player-2",
				allocations: [{ id: "allocation-2", amount: dec("0.2") }],
			},
		]);

		const result = await completeFundraiser("fundraiser-1");

		expect(result.ok).toBe(true);
	});

	it("creates INTERNAL distribution transactions for every participant", async () => {
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [{ id: "allocation-1", amount: dec("100") }],
			},
			{
				playerId: "player-2",
				allocations: [{ id: "allocation-2", amount: dec("0") }],
			},
		]);

		const result = await completeFundraiser("fundraiser-1");

		expect(result.ok).toBe(true);
		expect(txMock.playerTransaction.createMany).toHaveBeenCalledWith({
			data: [
				{
					playerId: "player-1",
					fundraiserId: "fundraiser-1",
					allocationId: "allocation-1",
					amount: dec("100"),
					type: "DISTRIBUTION",
					direction: "INCOME",
					status: "INTERNAL",
					description: "Fundraiser distribution",
				},
				{
					playerId: "player-2",
					fundraiserId: "fundraiser-1",
					allocationId: "allocation-2",
					amount: dec("0"),
					type: "DISTRIBUTION",
					direction: "INCOME",
					status: "INTERNAL",
					description: "Fundraiser distribution",
				},
			],
		});
	});

	it("treats null total contributions as zero", async () => {
		mockRaised(null);
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [{ id: "allocation-1", amount: dec("0") }],
			},
		]);

		const result = await completeFundraiser("fundraiser-1");

		expect(result.ok).toBe(true);
	});

	it("returns the error when creating distributions fails", async () => {
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [{ id: "allocation-1", amount: dec("100") }],
			},
		]);
		txMock.playerTransaction.createMany.mockRejectedValue(
			new Error("Duplicate active distribution"),
		);

		const result = await completeFundraiser("fundraiser-1");

		// the error escapes the $transaction callback, so Prisma rolls the status back
		expect(result).toEqual({
			ok: false,
			error: "Duplicate active distribution",
		});
	});

	it("redirects a PARENT without touching the database", async () => {
		asParent();

		await expectRedirect(() => completeFundraiser("fundraiser-1"));

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("allows an ADMIN_PARENT", async () => {
		asAdminParent();
		mockFundraiser([
			{
				playerId: "player-1",
				allocations: [{ id: "allocation-1", amount: dec("100") }],
			},
		]);

		const result = await completeFundraiser("fundraiser-1");

		expect(result.ok).toBe(true);
	});
});

describe("publishFundraiser", () => {
	it("publishes a completed fundraiser and its INTERNAL distributions", async () => {
		const result = await publishFundraiser("fundraiser-1");

		expect(result).toEqual({ ok: true, data: { success: true } });
		expect(txMock.fundraiser.updateMany).toHaveBeenCalledWith({
			where: { id: "fundraiser-1", status: { in: ["COMPLETED"] } },
			data: { status: "PUBLISHED" },
		});
		expect(txMock.playerTransaction.updateMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
				status: "INTERNAL",
				type: "DISTRIBUTION",
			},
			data: { status: "PUBLISHED" },
		});
	});

	it("returns an error when the fundraiser does not exist", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue(null);

		const result = await publishFundraiser("missing-fundraiser");

		expect(result).toEqual({ ok: false, error: "Fundraiser not found" });
		expect(txMock.playerTransaction.updateMany).not.toHaveBeenCalled();
	});

	it("returns an error when the fundraiser is already published", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue({
			status: "PUBLISHED",
			_count: { participants: 1 },
		});

		const result = await publishFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error:
				"Only completed fundraisers can be published. This fundraiser is published.",
		});
		expect(txMock.playerTransaction.updateMany).not.toHaveBeenCalled();
	});

	it("returns an error when the fundraiser is still a draft", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue({
			status: "DRAFT",
			_count: { participants: 1 },
		});

		const result = await publishFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error:
				"Only completed fundraisers can be published. This fundraiser is a draft.",
		});
	});

	it("returns an error when the fundraiser has no participants", async () => {
		txMock.fundraiserParticipant.count.mockResolvedValue(0);

		const result = await publishFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error: "A fundraiser must have at least one participant",
		});
		expect(txMock.playerTransaction.updateMany).not.toHaveBeenCalled();
	});

	it("redirects a PARENT without touching the database", async () => {
		asParent();

		await expectRedirect(() => publishFundraiser("fundraiser-1"));

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("allows an ADMIN_PARENT", async () => {
		asAdminParent();

		const result = await publishFundraiser("fundraiser-1");

		expect(result.ok).toBe(true);
	});
});

describe("unpublishFundraiser", () => {
	it("moves a published fundraiser back to completed and hides its distributions", async () => {
		const result = await unpublishFundraiser("fundraiser-1");

		expect(result).toEqual({ ok: true, data: { success: true } });
		expect(txMock.fundraiser.updateMany).toHaveBeenCalledWith({
			where: { id: "fundraiser-1", status: { in: ["PUBLISHED"] } },
			data: { status: "COMPLETED" },
		});
		expect(txMock.playerTransaction.updateMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
				status: "PUBLISHED",
				type: "DISTRIBUTION",
			},
			data: { status: "INTERNAL" },
		});
	});

	it("returns an error when the fundraiser does not exist", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue(null);

		const result = await unpublishFundraiser("missing-fundraiser");

		expect(result).toEqual({ ok: false, error: "Fundraiser not found" });
		expect(txMock.playerTransaction.updateMany).not.toHaveBeenCalled();
	});

	it("returns an error when the fundraiser is not published", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue({ status: "COMPLETED" });

		const result = await unpublishFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error:
				"Only published fundraisers can be unpublished. This fundraiser is completed.",
		});
		expect(txMock.playerTransaction.updateMany).not.toHaveBeenCalled();
	});

	it("redirects a PARENT without touching the database", async () => {
		asParent();

		await expectRedirect(() => unpublishFundraiser("fundraiser-1"));

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("allows an ADMIN_PARENT", async () => {
		asAdminParent();

		const result = await unpublishFundraiser("fundraiser-1");

		expect(result.ok).toBe(true);
	});
});

describe("reopenFundraiser", () => {
	it("reopens a completed or published fundraiser and voids its distributions", async () => {
		txMock.playerTransaction.updateMany.mockResolvedValue({ count: 2 });

		const result = await reopenFundraiser("fundraiser-1");

		expect(result).toEqual({ ok: true, data: { success: true } });
		expect(txMock.fundraiser.updateMany).toHaveBeenCalledWith({
			where: {
				id: "fundraiser-1",
				status: { in: ["COMPLETED", "PUBLISHED"] },
			},
			data: { status: "DRAFT" },
		});
		expect(txMock.playerTransaction.updateMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
				status: { in: ["INTERNAL", "PUBLISHED"] },
				type: "DISTRIBUTION",
			},
			data: { status: "VOID" },
		});
	});

	it("succeeds when there are no distributions to void", async () => {
		txMock.playerTransaction.updateMany.mockResolvedValue({ count: 0 });

		const result = await reopenFundraiser("fundraiser-1");

		expect(result).toEqual({ ok: true, data: { success: true } });
	});

	it("returns an error when the fundraiser does not exist", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue(null);

		const result = await reopenFundraiser("missing-fundraiser");

		expect(result).toEqual({ ok: false, error: "Fundraiser not found" });
		expect(txMock.playerTransaction.updateMany).not.toHaveBeenCalled();
	});

	it("returns an error when the fundraiser is already a draft", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue({
			id: "fundraiser-1",
			status: "DRAFT",
		});

		const result = await reopenFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error:
				"Only completed or published fundraisers can be reopened. This fundraiser is a draft.",
		});
		expect(txMock.playerTransaction.updateMany).not.toHaveBeenCalled();
	});

	it("redirects a PARENT without touching the database", async () => {
		asParent();

		await expectRedirect(() => reopenFundraiser("fundraiser-1"));

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("allows an ADMIN_PARENT", async () => {
		asAdminParent();

		const result = await reopenFundraiser("fundraiser-1");

		expect(result.ok).toBe(true);
	});
});
