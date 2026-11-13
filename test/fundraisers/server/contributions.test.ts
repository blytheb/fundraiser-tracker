import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		$transaction: vi.fn(),
		fundraiser: {
			findUnique: vi.fn(),
			updateMany: vi.fn(),
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

import { asParent, expectRedirect } from "../../helpers/auth";
import {
	addContribution,
	updateContribution,
	deleteContribution,
} from "@/features/fundraisers/actions/contributions";
beforeEach(() => {
	vi.clearAllMocks();
	// most tests use prismaMock as the transaction client too;
	// "runs inside a transaction" tests below pass a separate tx
	prismaMock.$transaction.mockImplementation(async (callback) =>
		callback(prismaMock),
	);
	prismaMock.fundraiser.updateMany.mockResolvedValue({ count: 1 });
});

describe("addContribution", () => {
	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		expect(await addContribution({
				fundraiserId: "missing-fundraiser",
				amount: 100,
				paymentMethod: "CASH",
				source: "SALES",
				date: "2026-10-09",
			})).toEqual({
			ok: false,
			error: "Fundraiser not found",
		});

		expect(prismaMock.fundraiserContribution.create).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser is completed", async () => {
		prismaMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		prismaMock.fundraiser.findUnique.mockResolvedValue({ status: "COMPLETED" });

		expect(await addContribution({
				fundraiserId: "fundraiser-1",
				amount: 100,
				paymentMethod: "CASH",
				source: "SALES",
				date: "2026-10-09",
			})).toEqual({
			ok: false,
			error:
				"Only draft fundraisers can be edited. This fundraiser is final.",
		});

		expect(prismaMock.fundraiserContribution.create).not.toHaveBeenCalled();
	});

	it("adds a contribution successfully", async () => {
		prismaMock.fundraiser.updateMany.mockResolvedValue({ count: 1 });

		const result = await addContribution({
			fundraiserId: "fundraiser-1",
			amount: 100,
			paymentMethod: "CASH",
			source: "SALES",
			date: "2026-10-09",
			description: "Fundraiser donation",
		});

		expect(prismaMock.fundraiserContribution.create).toHaveBeenCalledWith({
			data: {
				fundraiserId: "fundraiser-1",
				amount: 100,
				paymentMethod: "CASH",
				source: "SALES",
				date: new Date("2026-10-09"),
				description: "Fundraiser donation",
			},
		});

		expect(result).toEqual({ ok: true, data: undefined });
	});
});

describe("updateContribution", () => {
	it("throws an error when the contribution does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue(null);

		expect(await updateContribution("missing-contribution", {
				amount: 100,
				paymentMethod: "CASH",
				source: "SALES",
				date: "2026-10-09",
			})).toEqual({
			ok: false,
			error: "Contribution not found",
		});

		expect(prismaMock.fundraiser.updateMany).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser is completed", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "fundraiser-1",
		});

		prismaMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		prismaMock.fundraiser.findUnique.mockResolvedValue({ status: "COMPLETED" });

		expect(await updateContribution("contribution-1", {
				amount: 100,
				paymentMethod: "CASH",
				source: "SALES",
				date: "2026-10-09",
			})).toEqual({
			ok: false,
			error:
				"Only draft fundraisers can be edited. This fundraiser is final.",
		});

		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "missing-fundraiser",
		});

		prismaMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		expect(await updateContribution("contribution-1", {
				amount: 100,
				paymentMethod: "CASH",
				source: "SALES",
				date: "2026-10-09",
			})).toEqual({
			ok: false,
			error: "Fundraiser not found",
		});

		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
	});

	it("updates a contribution successfully", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "fundraiser-1",
		});
		prismaMock.fundraiser.updateMany.mockResolvedValue({ count: 1 });

		const result = await updateContribution("contribution-1", {
			amount: 150,
			paymentMethod: "CASH",
			source: "SALES",
			date: "2026-10-09",
			description: "Updated donation",
		});

		expect(prismaMock.fundraiserContribution.update).toHaveBeenCalledWith({
			where: { id: "contribution-1" },
			data: {
				amount: 150,
				paymentMethod: "CASH",
				source: "SALES",
				date: new Date("2026-10-09"),
				description: "Updated donation",
			},
		});

		expect(result).toEqual({ ok: true, data: undefined });
	});
});

describe("deleteContribution", () => {
	it("throws an error when the contribution does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue(null);

		expect(await deleteContribution("missing-contribution")).toEqual({
			ok: false,
			error: "Contribution not found",
		});

		expect(prismaMock.fundraiser.updateMany).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser is completed", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "fundraiser-1",
		});
		prismaMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		prismaMock.fundraiser.findUnique.mockResolvedValue({ status: "COMPLETED" });

		expect(await deleteContribution("contribution-1")).toEqual({
			ok: false,
			error:
				"Only draft fundraisers can be edited. This fundraiser is final.",
		});

		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "missing-fundraiser",
		});
		prismaMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		expect(await deleteContribution("contribution-1")).toEqual({
			ok: false,
			error: "Fundraiser not found",
		});

		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});

	it("deletes a contribution successfully", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "fundraiser-1",
		});
		prismaMock.fundraiser.updateMany.mockResolvedValue({ count: 1 });

		const result = await deleteContribution("contribution-1");

		expect(result).toEqual({ ok: true, data: undefined });

		expect(prismaMock.fundraiserContribution.delete).toHaveBeenCalledWith({
			where: { id: "contribution-1" },
		});
	});
});

describe("contribution action permissions", () => {
	it("redirects parents and does not touch the database", async () => {
		asParent();
		const data = {
			amount: 100,
			paymentMethod: "CASH" as const,
			source: "SALES" as const,
			date: "2026-10-09",
		};

		await expectRedirect(() =>
			addContribution({ fundraiserId: "fundraiser-1", ...data }),
		);
		await expectRedirect(() => updateContribution("contribution-1", data));
		await expectRedirect(() => deleteContribution("contribution-1"));

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.findUnique).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.create).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});
});

describe("contribution actions run inside a transaction", () => {
	const data = {
		amount: 100,
		paymentMethod: "CASH" as const,
		source: "SALES" as const,
		date: "2026-10-09",
	};

	function useSeparateTx() {
		const tx = {
			fundraiser: {
				updateMany: vi.fn().mockResolvedValue({ count: 1 }),
				findUnique: vi.fn(),
			},
			fundraiserContribution: {
				findUnique: vi.fn().mockResolvedValue({ fundraiserId: "fundraiser-1" }),
				create: vi.fn(),
				update: vi.fn(),
				delete: vi.fn(),
			},
		};
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(tx),
		);
		return tx;
	}

	it("addContribution locks the draft and creates via tx", async () => {
		const tx = useSeparateTx();

		await addContribution({ fundraiserId: "fundraiser-1", ...data });

		expect(tx.fundraiser.updateMany).toHaveBeenCalledWith({
			where: { id: "fundraiser-1", status: "DRAFT" },
			data: { updatedAt: expect.any(Date) },
		});
		expect(tx.fundraiserContribution.create).toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.create).not.toHaveBeenCalled();
	});

	it("updateContribution checks the contribution's fundraiser and updates via tx", async () => {
		const tx = useSeparateTx();

		await updateContribution("contribution-1", data);

		expect(tx.fundraiser.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: "fundraiser-1", status: "DRAFT" } }),
		);
		expect(tx.fundraiserContribution.update).toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
	});

	it("deleteContribution checks the contribution's fundraiser and deletes via tx", async () => {
		const tx = useSeparateTx();

		await deleteContribution("contribution-1");

		expect(tx.fundraiser.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: "fundraiser-1", status: "DRAFT" } }),
		);
		expect(tx.fundraiserContribution.delete).toHaveBeenCalledWith({
			where: { id: "contribution-1" },
		});
		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});
});
