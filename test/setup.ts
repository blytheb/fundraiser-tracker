// Runs before every test file (see vitest.config.ts setupFiles).
import { afterEach, beforeEach, vi } from "vitest";
import { asAdmin, getTestUser } from "./helpers/auth";

// Fake auth: same role rules as lib/permissions.ts, but the user comes from
// test/helpers/auth.ts instead of the request headers (which don't exist in tests).
vi.mock("@/lib/permissions", () => {
	// Same error shape as Next's redirect() (digest "NEXT_REDIRECT;replace;/;307;"),
	// built here so it still works in test files that mock next/navigation.
	function redirect(url: string): never {
		const error = new Error("NEXT_REDIRECT") as Error & { digest: string };
		error.digest = `NEXT_REDIRECT;replace;${url};307;`;
		throw error;
	}

	async function requireUser() {
		const user = getTestUser();
		if (!user) redirect("/");
		return user;
	}

	return {
		requireUser: vi.fn(requireUser),
		requireAdmin: vi.fn(async () => {
			const user = await requireUser();
			if (user.role !== "ADMIN" && user.role !== "ADMIN_PARENT") redirect("/");
			return user;
		}),
		requireParentAccess: vi.fn(async () => {
			const user = await requireUser();
			if (user.role !== "PARENT" && user.role !== "ADMIN_PARENT")
				redirect("/");
			return user;
		}),
	};
});

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
}));

// runAction logs unexpected errors with console.error. Silence it so test
// output stays readable; tests can still assert on it via vi.mocked(console.error).
beforeEach(() => {
	asAdmin(); // default: logged in as a plain ADMIN. Override per test.
	vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
});
