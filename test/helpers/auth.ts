// Shared fake auth for tests. test/setup.ts mocks "@/lib/permissions" with
// versions of requireUser/requireAdmin/requireParentAccess that read this state
// and follow the same role rules as the real ones (including redirect("/")).

export type TestRole = "ADMIN" | "PARENT" | "ADMIN_PARENT";

export type TestUser = {
	id: string;
	role: TestRole;
	name: string;
	email: string;
};

let currentUser: TestUser | null = null;

export function setTestUser(role: TestRole | null, id?: string) {
	currentUser = role
		? {
				id: id ?? `${role.toLowerCase()}-1`,
				role,
				name: `Test ${role}`,
				email: `${role.toLowerCase()}@test.local`,
			}
		: null;
	return currentUser;
}

export const asAdmin = (id = "admin-1") => setTestUser("ADMIN", id);
export const asParent = (id = "parent-1") => setTestUser("PARENT", id);
export const asAdminParent = (id = "admin-parent-1") =>
	setTestUser("ADMIN_PARENT", id);
export const asLoggedOut = () => setTestUser(null);

export function getTestUser() {
	return currentUser;
}

// redirect() throws an error whose digest starts with NEXT_REDIRECT
export function isRedirectError(error: unknown) {
	return (
		typeof error === "object" &&
		error !== null &&
		"digest" in error &&
		String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
	);
}

// usage: await expectRedirect(() => someAction(...))
export async function expectRedirect(fn: () => Promise<unknown>) {
	try {
		await fn();
	} catch (error) {
		if (isRedirectError(error)) return;
		throw error;
	}
	throw new Error("Expected a redirect, but the call completed normally");
}
