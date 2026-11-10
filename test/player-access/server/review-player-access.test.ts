import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		playerAccessRequest: {
			findUnique: vi.fn(),
			updateMany: vi.fn(),
		},
		parentPlayerLink: {
			upsert: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { revalidatePath } from "next/cache";
import { asParent, expectRedirect } from "../../helpers/auth";
import { reviewPlayerAccess } from "@/features/player-access/actions/review-player-access";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("reviewPlayerAccess", () => {
	it("approves a pending request and creates a parent-player link", async () => {
		const request = {
			id: "request-1",
			userId: "parent-1",
			playerId: "player-1",
			status: "PENDING",
		};

		prismaMock.playerAccessRequest.findUnique.mockResolvedValue(request);
		prismaMock.playerAccessRequest.updateMany.mockResolvedValue({
			count: 1,
		});
		prismaMock.parentPlayerLink.upsert.mockResolvedValue({});

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback({
				playerAccessRequest: prismaMock.playerAccessRequest,
				parentPlayerLink: prismaMock.parentPlayerLink,
			}),
		);

		const result = await reviewPlayerAccess("request-1", "APPROVED");

		expect(result).toEqual({ ok: true, data: { success: true } });

		expect(prismaMock.parentPlayerLink.upsert).toHaveBeenCalledWith({
			where: {
				userId_playerId: {
					userId: "parent-1",
					playerId: "player-1",
				},
			},
			update: {},
			create: {
				userId: "parent-1",
				playerId: "player-1",
				createdById: "admin-1",
			},
		});

		expect(prismaMock.playerAccessRequest.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					id: "request-1",
					status: "PENDING",
				},
				data: expect.objectContaining({
					status: "APPROVED",
					reviewedById: "admin-1",
				}),
			}),
		);
	});
	it("rejects a request that has already been reviewed", async () => {
		const request = {
			id: "request-1",
			userId: "parent-1",
			playerId: "player-1",
			status: "PENDING",
		};

		prismaMock.playerAccessRequest.findUnique.mockResolvedValue(request);
		prismaMock.parentPlayerLink.upsert.mockResolvedValue({});
		prismaMock.playerAccessRequest.updateMany.mockResolvedValue({
			count: 0,
		});

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback({
				playerAccessRequest: prismaMock.playerAccessRequest,
				parentPlayerLink: prismaMock.parentPlayerLink,
			}),
		);

		expect(await reviewPlayerAccess("request-1", "APPROVED")).toEqual({
			ok: false,
			error: "This request has already been reviewed.",
		});

		expect(prismaMock.playerAccessRequest.updateMany).toHaveBeenCalled();
		expect(prismaMock.parentPlayerLink.upsert).toHaveBeenCalled();
	});
	it("rejects a request that is no longer pending", async () => {
		prismaMock.playerAccessRequest.findUnique.mockResolvedValue({
			id: "request-1",
			userId: "parent-1",
			playerId: "player-1",
			status: "APPROVED",
		});

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback({
				playerAccessRequest: prismaMock.playerAccessRequest,
				parentPlayerLink: prismaMock.parentPlayerLink,
			}),
		);

		expect(await reviewPlayerAccess("request-1", "APPROVED")).toEqual({
			ok: false,
			error: "This request has already been reviewed.",
		});

		expect(prismaMock.parentPlayerLink.upsert).not.toHaveBeenCalled();
		expect(prismaMock.playerAccessRequest.updateMany).not.toHaveBeenCalled();
	});
	it("rejects a pending request without creating a parent-player link", async () => {
		prismaMock.playerAccessRequest.findUnique.mockResolvedValue({
			id: "request-1",
			userId: "parent-1",
			playerId: "player-1",
			status: "PENDING",
		});

		prismaMock.playerAccessRequest.updateMany.mockResolvedValue({
			count: 1,
		});

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback({
				playerAccessRequest: prismaMock.playerAccessRequest,
				parentPlayerLink: prismaMock.parentPlayerLink,
			}),
		);

		const result = await reviewPlayerAccess("request-1", "REJECTED");

		expect(result).toEqual({ ok: true, data: { success: true } });

		expect(prismaMock.parentPlayerLink.upsert).not.toHaveBeenCalled();

		expect(prismaMock.playerAccessRequest.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					id: "request-1",
					status: "PENDING",
				},
				data: expect.objectContaining({
					status: "REJECTED",
					reviewedById: "admin-1",
				}),
			}),
		);
	});
	it("redirects users who are not admins", async () => {
		asParent();

		await expectRedirect(() => reviewPlayerAccess("request-1", "APPROVED"));

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
		expect(revalidatePath).not.toHaveBeenCalled();
	});
});
