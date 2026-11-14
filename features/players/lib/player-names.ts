import type { Prisma } from "@prisma/client";

type Db = Prisma.TransactionClient;

/** Trims and collapses inner spaces: "  Jane   Ann " → "Jane Ann". */
export function cleanName(value: string) {
	return value.trim().replace(/\s+/g, " ");
}

/** Lowercased "first last" for comparing names ignoring case and spacing. */
export function nameKey(firstName: string, lastName: string) {
	return `${cleanName(firstName)} ${cleanName(lastName)}`.toLowerCase();
}

/**
 * Cleans a player's name and checks no other player already has it
 * (ignoring capitalization and extra spaces). Returns the cleaned names.
 * Pass excludePlayerId when renaming, so a player doesn't match itself.
 */
export async function assertUniquePlayerName(
	db: Db,
	rawFirstName: string,
	rawLastName: string,
	excludePlayerId?: string,
) {
	const firstName = cleanName(rawFirstName);
	const lastName = cleanName(rawLastName);

	if (!firstName || !lastName) {
		throw new Error("Enter the player's first and last name.");
	}

	const existing = await db.player.findFirst({
		where: {
			firstName: { equals: firstName, mode: "insensitive" },
			lastName: { equals: lastName, mode: "insensitive" },
			...(excludePlayerId ? { id: { not: excludePlayerId } } : {}),
		},
		select: { firstName: true, lastName: true, status: true },
	});

	if (existing) {
		throw new Error(
			`A player named "${existing.firstName} ${existing.lastName}" already exists${
				existing.status ? "" : " (inactive)"
			}. Use that player instead of creating a new one.`,
		);
	}

	return { firstName, lastName };
}
