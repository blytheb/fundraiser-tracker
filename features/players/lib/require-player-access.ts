import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";

/**
 * Checks that the logged-in user may see this player's data, and returns the user.
 * - Logged out: redirected (via requireUser).
 * - allowAdmins: true  → ADMIN and ADMIN_PARENT see any player; parents need a link.
 * - allowAdmins: false → everyone needs a parent link (the parent view, where an
 *   ADMIN_PARENT should only see their own children).
 * Throws "You do not have access to this player." when there's no link.
 */
export async function requirePlayerAccess(
	playerId: string,
	{ allowAdmins }: { allowAdmins: boolean },
) {
	const user = await requireUser();

	const isAdmin = user.role === "ADMIN" || user.role === "ADMIN_PARENT";
	if (allowAdmins && isAdmin) {
		return user;
	}

	const link = await prisma.parentPlayerLink.findUnique({
		where: {
			userId_playerId: {
				userId: user.id,
				playerId,
			},
		},
		select: { id: true },
	});

	if (!link) {
		throw new Error("You do not have access to this player.");
	}

	return user;
}
