import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authorization";
import { RequestPlayerAccessTestForm } from "./RequestPlayerAccessTestForm";

export default async function RequestPlayerAccessTestPage() {
	const user = await requireUser();

	if (user.role !== "PARENT") {
		return (
			<main className="p-8">
				Sign in with a parent account to run this test.
			</main>
		);
	}

	const players = await prisma.player.findMany({
		where: { status: true },
		select: {
			id: true,
			firstName: true,
			lastName: true,
		},
		orderBy: { lastName: "asc" },
	});

	return (
		<main className="mx-auto max-w-xl p-6">
			<h1 className="text-2xl font-bold">Request Player Access Test</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Temporary test page for parent access requests.
			</p>

			<RequestPlayerAccessTestForm players={players} />
		</main>
	);
}
