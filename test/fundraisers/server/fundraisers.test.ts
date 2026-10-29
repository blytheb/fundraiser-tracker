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
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		const result = await updateFundraiser("fundraiser-1", data as never);

		expect(prismaMock.fundraiser.update).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			data,
		});

		expect(result).toEqual(fundraiser);
	});
	it("rejects updating a completed fundraiser", async () => {
		const data = {
			name: "Updated Cookie Sale",
			description: "Updated fundraiser",
			startDate: new Date("2026-11-01"),
		};

		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		await expect(
			updateFundraiser("fundraiser-1", data as never),
		).rejects.toThrow("Completed fundraisers cannot be edited.");

		expect(prismaMock.fundraiser.update).not.toHaveBeenCalled();
	});
});

describe("deleteFundraiser", () => {
	it("deletes the fundraiser with the specified ID", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			name: "Cookie Sale",
		};

		prismaMock.fundraiser.delete.mockResolvedValue(fundraiser);
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		const result = await deleteFundraiser("fundraiser-1");

		expect(prismaMock.fundraiser.delete).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
		});

		expect(result).toEqual(fundraiser);
	});
	it("rejects deleting a completed fundraiser", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		} as any);

		await expect(deleteFundraiser("fundraiser-1")).rejects.toThrow(
			"Completed fundraisers cannot be deleted.",
		);

		expect(prismaMock.fundraiser.delete).not.toHaveBeenCalled();
	});
});
