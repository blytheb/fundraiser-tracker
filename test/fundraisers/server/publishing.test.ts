import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFundraiserFinancialSummary } from "@/features/fundraisers/actions/fundraiserAllocation";

const { txMock, prismaMock } = vi.hoisted(() => {
	const txMock = {
		fundraiser: {
			findUnique: vi.fn(),
			update: vi.fn(),
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
		},
	};
});

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/features/fundraisers/actions/fundraiserAllocation", () => ({
	getFundraiserFinancialSummary: vi.fn(),
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
	});
});

describe("completeFundraiser", () => {
	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(completeFundraiser("missing-fundraiser")).rejects.toThrow(
			"Fundraiser not found",
		);
	});
	it("throws an error when the fundraiser is already completed", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		await expect(completeFundraiser("fundraiser-1")).rejects.toThrow(
			"Fundraiser is already completed",
		);

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("throws an error when funds remain unallocated", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		vi.mocked(getFundraiserFinancialSummary).mockResolvedValue({
			totalRaised: 100,
			currentlyAllocated: 75,
			availableToAllocate: 25,
			participantCount: 2,
		});

		await expect(completeFundraiser("fundraiser-1")).rejects.toThrow(
			"All funds must be allocated before completing",
		);

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("throws an error when funds remain unallocated", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		vi.mocked(getFundraiserFinancialSummary).mockResolvedValue({
			totalRaised: 100,
			currentlyAllocated: 75,
			availableToAllocate: 25,
			participantCount: 2,
		});

		await expect(completeFundraiser("fundraiser-1")).rejects.toThrow(
			"All funds must be allocated before completing",
		);

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("completes a fundraiser successfully", async () => {
		vi.mocked(getFundraiserFinancialSummary).mockResolvedValue({
			totalRaised: 100,
			currentlyAllocated: 100,
			availableToAllocate: 0,
			participantCount: 2,
		});

		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		prismaMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: true,
		});

		const result = await completeFundraiser("fundraiser-1");

		expect(prismaMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isCompleted: true },
		});

		expect(result).toEqual({
			id: "fundraiser-1",
			isCompleted: true,
		});
	});
});

describe("incompleteFundraiser", () => {
	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		await expect(incompleteFundraiser("missing-fundraiser")).rejects.toThrow(
			"Fundraiser not found",
		);

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});
	it("throws an error when the fundraiser is already in incomplete mode", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		await expect(incompleteFundraiser("fundraiser-1")).rejects.toThrow(
			"Fundraiser is already in draft mode",
		);

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("returns a completed fundraiser to inmcomplete mode", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		prismaMock.fundraiser.update.mockResolvedValue({
			id: "fundraiser-1",
			isCompleted: false,
		});

		const result = await incompleteFundraiser("fundraiser-1");

		expect(prismaMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data: { isCompleted: false },
		});

		expect(result).toEqual({
			id: "fundraiser-1",
			isCompleted: false,
		});
	});
});
