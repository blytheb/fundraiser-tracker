import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireUser() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/");
	}

	return session.user;
}

export async function requireAdmin() {
	const user = await requireUser();

	if (user.role !== "ADMIN") {
		redirect("/dashboard");
	}

	return user;
}

export async function requireParentAccess() {
	const user = await requireUser();

	if (user.role !== "PARENT" && !user.hasParentAccess) {
		redirect("/dashboard");
	}

	return user;
}
