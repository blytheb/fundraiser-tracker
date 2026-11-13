import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, txMock } = vi.hoisted(() => {
	const txMock = {
		fundraiser: {
			updateMany: vi.fn(),
			findUnique: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	};

	return {
		txMock,
		prismaMock: {
			$transaction: vi.fn(),
			fundraiser: {
				create: vi.fn(),
				update: vi.fn(),
				delete: vi.fn(),
				findUnique: vi.fn(),
				updateMany: vi.fn(),
			},
		},
	};
});

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { asParent, expectRedirect } from "../../helpers/auth";
import {
	createFundraiser,
	updateFundraiser,
	deleteFundraiser,
} from "@/features/fundraisers/actions/fundraisers";

beforeEach(() => {
	vi.clearAllMocks();
	prismaMock.$transaction.mockImplementation(async (callback) =>
		callback(txMock),
	);
	// default: fundraiser is a draft (assertDraft's lock update matches)
	txMock.fundraiser.updateMany.mockResolvedValue({ count: 1 });
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
			status: "DRAFT",
		};

		prismaMock.fundraiser.create.mockResolvedValue(fundraiser);

		const result = await createFundraiser(data as never);

		expect(prismaMock.fundraiser.create).toHaveBeenCalledWith({ data });
		expect(result).toEqual({ ok: true, data: fundraiser });
	});
});

describe("updateFundraiser", () => {
	const data = {
		name: "Updated Cookie Sale",
		description: "Updated fundraiser",
		startDate: new Date("2026-11-01"),
	};

	it("updates a draft fundraiser inside a transaction", async () => {
		const fundraiser = { id: "fundraiser-1", ...data, status: "DRAFT" };
		txMock.fundraiser.update.mockResolvedValue(fundraiser);

		const result = await updateFundraiser("fundraiser-1", data as never);

		expect(txMock.fundraiser.updateMany).toHaveBeenCalledWith({
			where: { id: "fundraiser-1", status: "DRAFT" },
			data: { updatedAt: expect.any(Date) },
		});
		expect(txMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data,
		});
		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
		expect(result).toEqual({ ok: true, data: fundraiser });
	});

	it("rejects updating a completed fundraiser", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue({ status: "COMPLETED" });

		const result = await updateFundraiser("fundraiser-1", data as never);

		expect(result).toEqual({
			ok: false,
			error:
				"Only draft fundraisers can be edited. This fundraiser is final.",
		});
		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
	});

	it("returns an error when the fundraiser does not exist", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue(null);

		const result = await updateFundraiser("missing", data as never);

		expect(result).toEqual({ ok: false, error: "Fundraiser not found" });
		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
	});
});

describe("deleteFundraiser", () => {
	it("deletes a draft fundraiser inside a transaction", async () => {
		const fundraiser = { id: "fundraiser-1", name: "Cookie Sale" };
		txMock.fundraiser.delete.mockResolvedValue(fundraiser);

		const result = await deleteFundraiser("fundraiser-1");

		expect(txMock.fundraiser.delete).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
		});
		expect(prismaMock.fundraiser.delete).not.toHaveBeenCalled();
		expect(result).toEqual({ ok: true, data: fundraiser });
	});

	it("rejects deleting a published fundraiser", async () => {
		txMock.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		txMock.fundraiser.findUnique.mockResolvedValue({ status: "PUBLISHED" });

		const result = await deleteFundraiser("fundraiser-1");

		expect(result).toEqual({
			ok: false,
			error:
				"Only draft fundraisers can be deleted. This fundraiser is shared with parents.",
		});
		expect(txMock.fundraiser.delete).not.toHaveBeenCalled();
	});
});

describe("fundraiser action permissions", () => {
	it("redirects parents and does not touch the database", async () => {
		asParent();

		await expectRedirect(() => createFundraiser({ name: "X" } as never));
		await expectRedirect(() => updateFundraiser("fundraiser-1", {} as never));
		await expectRedirect(() => deleteFundraiser("fundraiser-1"));

		expect(prismaMock.fundraiser.create).not.toHaveBeenCalled();
		expect(prismaMock.$transaction).not.toHaveBeenCalled();
		expect(txMock.fundraiser.update).not.toHaveBeenCalled();
		expect(txMock.fundraiser.delete).not.toHaveBeenCalled();
	});
});
