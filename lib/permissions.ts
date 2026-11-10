import { cache } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// cache() runs the session lookup once per request. A page that calls several
// data functions (each calling requireAdmin) now checks the session only once.
const getSessionUser = cache(async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return session?.user ?? null;
});

export async function requireUser() {
	const user = await getSessionUser();

	if (!user) {
		redirect("/");
	}

	return user;
}

export async function requireAdmin() {
	const user = await requireUser();

	if (user.role !== "ADMIN" && user.role !== "ADMIN_PARENT") {
		redirect("/");
	}

	return user;
}

export async function requireParentAccess() {
	const user = await requireUser();

	if (user.role !== "PARENT" && user.role !== "ADMIN_PARENT") {
		redirect("/");
	}

	return user;
}
