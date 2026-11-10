// lib/action-result.ts
export type ActionResult<T = void> =
	| { ok: true; data: T }
	| { ok: false; error: string };

// Runs the action body and turns thrown Errors into { ok: false }.
// Redirects (from requireAdmin) are re-thrown so they still work.
export async function runAction<T>(
	fn: () => Promise<T>,
): Promise<ActionResult<T>> {
	try {
		return { ok: true, data: await fn() };
	} catch (error) {
		if (
			error instanceof Error &&
			"digest" in error &&
			String(error.digest).startsWith("NEXT_REDIRECT")
		) {
			throw error;
		}
		console.error(error);
		return {
			ok: false,
			error: error instanceof Error ? error.message : "Something went wrong",
		};
	}
}
