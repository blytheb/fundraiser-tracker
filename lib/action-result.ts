import { unstable_rethrow } from "next/navigation";
import { Prisma } from "@prisma/client";

// Every server action returns one of these instead of throwing.
// Next.js hides thrown error messages in production, so returning the
// message is the only way the user sees *why* something failed.
export type ActionResult<T = void> =
	| { ok: true; data: T }
	| { ok: false; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

function toUserMessage(error: unknown): string {
	// Database errors: translate the common ones, never show raw Prisma text
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		switch (error.code) {
			case "P2002":
				return "That record already exists.";
			case "P2003":
				return "This item is still linked to other records and can't be changed.";
			case "P2025":
				return "That record no longer exists. Refresh the page and try again.";
			case "P2034":
				return "Someone else changed this at the same time. Please try again.";
			default:
				return GENERIC_ERROR;
		}
	}

	if (
		error instanceof Prisma.PrismaClientValidationError ||
		error instanceof Prisma.PrismaClientUnknownRequestError ||
		error instanceof Prisma.PrismaClientInitializationError ||
		error instanceof Prisma.PrismaClientRustPanicError
	) {
		return GENERIC_ERROR;
	}

	// Errors we throw ourselves, e.g. throw new Error("Team not found")
	if (error instanceof Error && error.message) {
		return error.message;
	}

	return GENERIC_ERROR;
}

// Wrap a server action's body:
//   export async function doThing() {
//     return runAction(async () => { await requireAdmin(); ... return data; });
//   }
// redirect()/notFound() (e.g. from requireAdmin) still work, they are re-thrown.
export async function runAction<T>(
	fn: () => Promise<T>,
): Promise<ActionResult<T>> {
	try {
		return { ok: true, data: await fn() };
	} catch (error) {
		unstable_rethrow(error);
		console.error(error);
		return { ok: false, error: toUserMessage(error) };
	}
}
