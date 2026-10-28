import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, authorizationMock, revalidatePathMock } = vi.hoisted(
	() => ({
		prismaMock: {
			playerAccessRequest: {
				findFirst: vi.fn(),
				update: vi.fn(),
			},
		},
		authorizationMock: {
			requireUser: vi.fn(),
		},
		revalidatePathMock: vi.fn(),
	}),
);

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/lib/authorization", () => ({
	requireUser: authorizationMock.requireUser,
}));

vi.mock("next/cache", () => ({
	revalidatePath: revalidatePathMock,
}));

import { cancelPlayerAccessRequest } from "@/features/player-access/actions/cancel-player-access-request";

beforeEach(() => {
	vi.clearAllMocks();

	authorizationMock.requireUser.mockResolvedValue({
		id: "parent-1",
		role: "PARENT",
	});

	prismaMock.playerAccessRequest.findFirst.mockResolvedValue({
		id: "request-1",
	});

	prismaMock.playerAccessRequest.update.mockResolvedValue({
		id: "request-1",
		status: "CANCELLED",
	});
});

describe("cancelPlayerAccessRequest", () => {
	it("cancels the parent's own pending request without deleting it", async () => {
		const result = await cancelPlayerAccessRequest("request-1");

		expect(result).toEqual({ success: true });

		expect(prismaMock.playerAccessRequest.findFirst).toHaveBeenCalledWith({
			where: {
				id: "request-1",
				userId: "parent-1",
				status: "PENDING",
			},
			select: {
				id: true,
			},
		});

		expect(prismaMock.playerAccessRequest.update).toHaveBeenCalledWith({
			where: {
				id: "request-1",
			},
			data: {
				status: "CANCELLED",
			},
		});

		expect(prismaMock.playerAccessRequest).not.toHaveProperty("delete");
	});
	it("does not cancel another parent's request", async () => {
		prismaMock.playerAccessRequest.findFirst.mockResolvedValue(null);

		await expect(cancelPlayerAccessRequest("request-1")).rejects.toThrow(
			"Pending access request not found or you are not authorized to cancel it.",
		);

		expect(prismaMock.playerAccessRequest.findFirst).toHaveBeenCalledWith({
			where: {
				id: "request-1",
				userId: "parent-1",
				status: "PENDING",
			},
			select: {
				id: true,
			},
		});

		expect(prismaMock.playerAccessRequest.update).not.toHaveBeenCalled();
	});
	it("does not cancel a request that is no longer pending", async () => {
		prismaMock.playerAccessRequest.findFirst.mockResolvedValue(null);

		await expect(cancelPlayerAccessRequest("request-1")).rejects.toThrow(
			"Pending access request not found or you are not authorized to cancel it.",
		);

		expect(prismaMock.playerAccessRequest.update).not.toHaveBeenCalled();
	});
	it("rejects non-parent accounts", async () => {
		authorizationMock.requireUser.mockResolvedValue({
			id: "admin-1",
			role: "ADMIN",
		});

		await expect(cancelPlayerAccessRequest("request-1")).rejects.toThrow(
			"Only parent accounts can cancel access requests.",
		);

		expect(prismaMock.playerAccessRequest.findFirst).not.toHaveBeenCalled();
		expect(prismaMock.playerAccessRequest.update).not.toHaveBeenCalled();
	});
});
