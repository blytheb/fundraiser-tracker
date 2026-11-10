import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiser: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
		},
		parentPlayerLink: {
			findUnique: vi.fn(),
		},
	},
}));
vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { asParent, expectRedirect } from "../../helpers/auth";
import {
	getFundraisers,
	getFundraiserById,
} from "@/features/fundraisers/data/fundraisers";

beforeEach(() => {
	vi.clearAllMocks();
	// admin functions run as the default test user (plain ADMIN)
	prismaMock.parentPlayerLink.findUnique.mockResolvedValue({
		id: "link-1",
	} as never);
});

describe("getFundraisers", () => {
	it("gets all fundraisers without a search term", async () => {
		const fundraisers = [
			{ id: "fundraiser-1", name: "Cookie Sale" },
			{ id: "fundraiser-2", name: "Car Wash" },
		];

		prismaMock.fundraiser.findMany.mockResolvedValue(fundraisers);

		const result = await getFundraisers();

		expect(prismaMock.fundraiser.findMany).toHaveBeenCalledWith({
			where: undefined,
			orderBy: { startDate: "desc" },
		});
		expect(result).toEqual(fundraisers);
	});

	it("filters fundraisers by name when a search term is provided", async () => {
		const fundraisers = [{ id: "fundraiser-1", name: "Cookie Sale" }];

		prismaMock.fundraiser.findMany.mockResolvedValue(fundraisers);

		const result = await getFundraisers("cookie");

		expect(prismaMock.fundraiser.findMany).toHaveBeenCalledWith({
			where: {
				name: {
					contains: "cookie",
					mode: "insensitive",
				},
			},
			orderBy: { startDate: "desc" },
		});
		expect(result).toEqual(fundraisers);
	});
});

describe("getFundraiserById", () => {
	it("gets a fundraiser by its ID", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			name: "Cookie Sale",
		};

		prismaMock.fundraiser.findUnique.mockResolvedValue(fundraiser);

		const result = await getFundraiserById("fundraiser-1");

		expect(prismaMock.fundraiser.findUnique).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
		});
		expect(result).toEqual(fundraiser);
	});
});




describe("fundraiser data permissions", () => {
	it("redirects parents from admin fundraiser data", async () => {
		asParent();

		await expectRedirect(() => getFundraisers());
		await expectRedirect(() => getFundraiserById("fundraiser-1"));

		expect(prismaMock.fundraiser.findMany).not.toHaveBeenCalled();
		expect(prismaMock.fundraiser.findUnique).not.toHaveBeenCalled();
	});

});
