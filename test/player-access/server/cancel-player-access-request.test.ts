import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		playerAccessRequest: {
			findFirst: vi.fn(),
			update: vi.fn(),
		},
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { revalidatePath } from "next/cache";
import {
	asAdmin,
	asAdminParent,
	asParent,
	expectRedirect,
} from "../../helpers/auth";
import { cancelPlayerAccessRequest } from "@/features/player-access/actions/cancel-player-access-request";

beforeEach(() => {
	vi.clearAllMocks();

	asParent("parent-1");

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

		expect(result).toEqual({ ok: true, data: { success: true } });
		expect(revalidatePath).toHaveBeenCalled();

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

		expect(await cancelPlayerAccessRequest("request-1")).toEqual({
			ok: false,
			error: "Pending access request not found or you are not authorized to cancel it.",
		});

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

		expect(await cancelPlayerAccessRequest("request-1")).toEqual({
			ok: false,
			error: "Pending access request not found or you are not authorized to cancel it.",
		});

		expect(prismaMock.playerAccessRequest.update).not.toHaveBeenCalled();
	});
	it("redirects accounts without parent access", async () => {
		asAdmin();

		await expectRedirect(() => cancelPlayerAccessRequest("request-1"));

		expect(prismaMock.playerAccessRequest.findFirst).not.toHaveBeenCalled();
		expect(prismaMock.playerAccessRequest.update).not.toHaveBeenCalled();
	});

	it("allows admin-parent accounts to cancel their own request", async () => {
		asAdminParent("admin-parent-1");

		const result = await cancelPlayerAccessRequest("request-1");

		expect(result.ok).toBe(true);
		expect(prismaMock.playerAccessRequest.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ userId: "admin-parent-1" }),
			}),
		);
	});
});
