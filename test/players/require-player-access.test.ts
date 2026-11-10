import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	asAdmin,
	asAdminParent,
	asLoggedOut,
	asParent,
	expectRedirect,
} from "@/test/helpers/auth";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		parentPlayerLink: { findUnique: vi.fn() },
	},
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { requirePlayerAccess } from "@/features/players/lib/require-player-access";

const linked = () =>
	prismaMock.parentPlayerLink.findUnique.mockResolvedValue({ id: "link-1" });
const notLinked = () =>
	prismaMock.parentPlayerLink.findUnique.mockResolvedValue(null);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("requirePlayerAccess", () => {
	it("redirects a logged-out user", async () => {
		asLoggedOut();
		await expectRedirect(() =>
			requirePlayerAccess("p1", { allowAdmins: true }),
		);
		expect(prismaMock.parentPlayerLink.findUnique).not.toHaveBeenCalled();
	});

	describe("allowAdmins: true (admin and shared data)", () => {
		it.each([
			["ADMIN", asAdmin],
			["ADMIN_PARENT", asAdminParent],
		])("lets a %s see any player without a link", async (_role, login) => {
			const user = login();
			notLinked();

			await expect(
				requirePlayerAccess("p1", { allowAdmins: true }),
			).resolves.toEqual(user);
			expect(prismaMock.parentPlayerLink.findUnique).not.toHaveBeenCalled();
		});

		it("lets a linked PARENT through", async () => {
			asParent();
			linked();

			await expect(
				requirePlayerAccess("p1", { allowAdmins: true }),
			).resolves.toMatchObject({ role: "PARENT" });
		});

		it("blocks a PARENT who isn't linked", async () => {
			asParent();
			notLinked();

			await expect(
				requirePlayerAccess("p1", { allowAdmins: true }),
			).rejects.toThrow("You do not have access to this player.");
		});
	});

	describe("allowAdmins: false (parent view)", () => {
		it("checks the link for the current user and player", async () => {
			asParent("parent-7");
			linked();

			await requirePlayerAccess("p9", { allowAdmins: false });

			expect(prismaMock.parentPlayerLink.findUnique).toHaveBeenCalledWith({
				where: { userId_playerId: { userId: "parent-7", playerId: "p9" } },
				select: { id: true },
			});
		});

		it("requires a link even for an ADMIN_PARENT", async () => {
			asAdminParent();
			notLinked();

			await expect(
				requirePlayerAccess("p1", { allowAdmins: false }),
			).rejects.toThrow("You do not have access to this player.");
		});

		it("lets an ADMIN_PARENT see their own linked child", async () => {
			asAdminParent();
			linked();

			await expect(
				requirePlayerAccess("p1", { allowAdmins: false }),
			).resolves.toMatchObject({ role: "ADMIN_PARENT" });
		});
	});
});
