import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";
import {
	assertDraft,
	claimStatus,
} from "@/features/fundraisers/lib/fundraiser-status";

// Minimal transaction client: only the two fundraiser methods the helpers use.
const tx = {
	fundraiser: {
		updateMany: vi.fn(),
		findUnique: vi.fn(),
	},
};
const asTx = tx as unknown as Prisma.TransactionClient;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("assertDraft", () => {
	it("passes for a draft fundraiser and locks it with a conditional update", async () => {
		tx.fundraiser.updateMany.mockResolvedValue({ count: 1 });

		await expect(assertDraft(asTx, "f1")).resolves.toBeUndefined();

		expect(tx.fundraiser.updateMany).toHaveBeenCalledWith({
			where: { id: "f1", status: "DRAFT" },
			data: { updatedAt: expect.any(Date) },
		});
		// no second lookup needed on success
		expect(tx.fundraiser.findUnique).not.toHaveBeenCalled();
	});

	it("throws 'Fundraiser not found' when it doesn't exist", async () => {
		tx.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		tx.fundraiser.findUnique.mockResolvedValue(null);

		await expect(assertDraft(asTx, "missing")).rejects.toThrow(
			"Fundraiser not found",
		);
	});

	it.each([
		["COMPLETED", "completed"],
		["PUBLISHED", "published"],
	] as const)("explains why a %s fundraiser can't be edited", async (status, phrase) => {
		tx.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		tx.fundraiser.findUnique.mockResolvedValue({ status });

		await expect(assertDraft(asTx, "f1")).rejects.toThrow(
			`Only draft fundraisers can be edited. This fundraiser is ${phrase}.`,
		);
	});

	it("uses the given action in the message", async () => {
		tx.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		tx.fundraiser.findUnique.mockResolvedValue({ status: "COMPLETED" });

		await expect(assertDraft(asTx, "f1", "deleted")).rejects.toThrow(
			"Only draft fundraisers can be deleted. This fundraiser is completed.",
		);
	});
});

describe("claimStatus", () => {
	it("moves the fundraiser only if it's in the expected status", async () => {
		tx.fundraiser.updateMany.mockResolvedValue({ count: 1 });

		await claimStatus(asTx, "f1", {
			from: "COMPLETED",
			to: "PUBLISHED",
			action: "published",
		});

		expect(tx.fundraiser.updateMany).toHaveBeenCalledWith({
			where: { id: "f1", status: { in: ["COMPLETED"] } },
			data: { status: "PUBLISHED" },
		});
		expect(tx.fundraiser.findUnique).not.toHaveBeenCalled();
	});

	it("accepts several starting statuses", async () => {
		tx.fundraiser.updateMany.mockResolvedValue({ count: 1 });

		await claimStatus(asTx, "f1", {
			from: ["COMPLETED", "PUBLISHED"],
			to: "DRAFT",
			action: "reopened",
		});

		expect(tx.fundraiser.updateMany).toHaveBeenCalledWith({
			where: { id: "f1", status: { in: ["COMPLETED", "PUBLISHED"] } },
			data: { status: "DRAFT" },
		});
	});

	it("throws 'Fundraiser not found' when it doesn't exist", async () => {
		tx.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		tx.fundraiser.findUnique.mockResolvedValue(null);

		await expect(
			claimStatus(asTx, "missing", {
				from: "DRAFT",
				to: "COMPLETED",
				action: "completed",
			}),
		).rejects.toThrow("Fundraiser not found");
	});

	it("explains the current status when the claim fails", async () => {
		tx.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		tx.fundraiser.findUnique.mockResolvedValue({ status: "DRAFT" });

		await expect(
			claimStatus(asTx, "f1", {
				from: "COMPLETED",
				to: "PUBLISHED",
				action: "published",
			}),
		).rejects.toThrow(
			"Only completed fundraisers can be published. This fundraiser is a draft.",
		);
	});

	it("lists every allowed status in the message", async () => {
		tx.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		tx.fundraiser.findUnique.mockResolvedValue({ status: "DRAFT" });

		await expect(
			claimStatus(asTx, "f1", {
				from: ["COMPLETED", "PUBLISHED"],
				to: "DRAFT",
				action: "reopened",
			}),
		).rejects.toThrow(
			"Only completed or published fundraisers can be reopened. This fundraiser is a draft.",
		);
	});
});
