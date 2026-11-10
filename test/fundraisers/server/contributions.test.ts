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

import { asParent, expectRedirect } from "../../helpers/auth";
import {
	addContribution,
	updateContribution,
	deleteContribution,
} from "@/features/fundraisers/actions/contributions";
beforeEach(() => {
	vi.clearAllMocks();
});

describe("addContribution", () => {
	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		expect(await addContribution({
				fundraiserId: "missing-fundraiser",
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
				date: "2026-10-09",
			})).toEqual({
			ok: false,
			error: "Fundraiser not found",
		});

		expect(prismaMock.fundraiserContribution.create).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser is completed", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			status: "COMPLETED",
		});

		expect(await addContribution({
				fundraiserId: "fundraiser-1",
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
				date: "2026-10-09",
			})).toEqual({
			ok: false,
			error: "Completed Fundraisers cannot be edited",
		});

		expect(prismaMock.fundraiserContribution.create).not.toHaveBeenCalled();
	});

	it("adds a contribution successfully", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			status: "DRAFT",
		});

		const result = await addContribution({
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

		expect(result).toEqual({ ok: true, data: undefined });
	});
});

describe("updateContribution", () => {
	it("throws an error when the contribution does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue(null);

		expect(await updateContribution("missing-contribution", {
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
				date: "2026-10-09",
			})).toEqual({
			ok: false,
			error: "Contribution not found",
		});

		expect(prismaMock.fundraiser.findUnique).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser is completed", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "fundraiser-1",
		});

		prismaMock.fundraiser.findUnique.mockResolvedValue({
			status: "COMPLETED",
		});

		expect(await updateContribution("contribution-1", {
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
				date: "2026-10-09",
			})).toEqual({
			ok: false,
			error: "Completed Fundraisers cannot be edited",
		});

		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "missing-fundraiser",
		});

		prismaMock.fundraiser.findUnique.mockResolvedValue(null);

		expect(await updateContribution("contribution-1", {
				amount: 100,
				paymentMethod: "CASH",
				source: "DONATION",
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
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			status: "DRAFT",
		});

		const result = await updateContribution("contribution-1", {
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

		expect(prismaMock.fundraiser.findUnique).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser is completed", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "fundraiser-1",
		});
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			status: "COMPLETED",
		});

		expect(await deleteContribution("contribution-1")).toEqual({
			ok: false,
			error: "Completed Fundraisers cannot be edited",
		});

		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});

	it("throws an error when the fundraiser does not exist", async () => {
		prismaMock.fundraiserContribution.findUnique.mockResolvedValue({
			fundraiserId: "missing-fundraiser",
		});
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
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			status: "DRAFT",
		});

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

		expect(prismaMock.fundraiser.findUnique).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.findUnique).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.create).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.update).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserContribution.delete).not.toHaveBeenCalled();
	});
});
