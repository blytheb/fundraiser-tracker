import type { Pot } from "@prisma/client";
import { POT_LABELS } from "@/lib/labels";

/** Validates a pot from the client; missing means GENERAL. */
export function parsePot(value: string | undefined | null): Pot {
	if (!value) return "GENERAL";
	if (!(value in POT_LABELS)) {
		throw new Error("Choose a pot.");
	}
	return value as Pot;
}
