import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { runAction } from "@/lib/action-result";
import { isRedirectError } from "../helpers/auth";

const GENERIC = "Something went wrong. Please try again.";

function knownError(code: string) {
	return new Prisma.PrismaClientKnownRequestError("raw prisma message", {
		code,
		clientVersion: "6.19.3",
	});
}

describe("runAction", () => {
	it("wraps the returned value in { ok: true, data }", async () => {
		await expect(runAction(async () => ({ id: "1" }))).resolves.toEqual({
			ok: true,
			data: { id: "1" },
		});
	});

	it("passes the message of an Error we throw through to the user", async () => {
		const result = await runAction(async () => {
			throw new Error("Fundraiser not found");
		});

		expect(result).toEqual({ ok: false, error: "Fundraiser not found" });
	});

	it.each([
		["P2002", "That record already exists."],
		[
			"P2003",
			"This item is still linked to other records and can't be changed.",
		],
		["P2025", "That record no longer exists. Refresh the page and try again."],
		["P2034", "Someone else changed this at the same time. Please try again."],
		["P9999", GENERIC],
	])("maps Prisma error %s to a friendly message", async (code, message) => {
		const result = await runAction(async () => {
			throw knownError(code);
		});

		expect(result).toEqual({ ok: false, error: message });
	});

	it("never exposes the raw Prisma message", async () => {
		const result = await runAction(async () => {
			throw knownError("P2002");
		});

		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).not.toContain("raw prisma message");
	});

	it("returns the generic message for a Prisma validation error", async () => {
		const result = await runAction(async () => {
			throw new Prisma.PrismaClientValidationError("bad query details", {
				clientVersion: "6.19.3",
			});
		});

		expect(result).toEqual({ ok: false, error: GENERIC });
	});

	it("returns the generic message when something other than an Error is thrown", async () => {
		const result = await runAction(async () => {
			throw "a string";
		});

		expect(result).toEqual({ ok: false, error: GENERIC });
	});

	it("returns the generic message for an Error with an empty message", async () => {
		const result = await runAction(async () => {
			throw new Error("");
		});

		expect(result).toEqual({ ok: false, error: GENERIC });
	});

	it("logs handled errors with console.error", async () => {
		await runAction(async () => {
			throw new Error("boom");
		});

		expect(console.error).toHaveBeenCalled();
	});

	it("re-throws redirect() so requireAdmin redirects still work", async () => {
		const promise = runAction(async () => {
			redirect("/");
		});

		await expect(promise).rejects.toSatisfy(isRedirectError);
		expect(console.error).not.toHaveBeenCalled();
	});

	it("re-throws a redirect error built with the raw digest", async () => {
		const error = Object.assign(new Error("NEXT_REDIRECT"), {
			digest: "NEXT_REDIRECT;replace;/;307;",
		});

		await expect(
			runAction(async () => {
				throw error;
			}),
		).rejects.toBe(error);
	});

	it("re-throws notFound()", async () => {
		const promise = runAction(async () => {
			notFound();
		});

		await expect(promise).rejects.toMatchObject({
			digest: expect.stringContaining("404"),
		});
	});
});
