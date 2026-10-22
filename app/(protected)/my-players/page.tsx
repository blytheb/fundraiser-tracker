import Link from "next/link";
import { getMyLinkedPlayers } from "@/features/users/queries/get-users-linked-players";

export default async function MyPlayersPage() {
	const links = await getMyLinkedPlayers();

	return (
		<main className="mx-auto max-w-5xl p-6">
			<header>
				<h1 className="text-2xl font-bold">My Players</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					View the players connected to your parent account.
				</p>
			</header>

			{links.length === 0 ? (
				<div className="mt-8 rounded-xl border p-6">
					<h2 className="font-semibold">No linked players yet</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Once an administrator approves your access request, your player will
						appear here.
					</p>
					<Link
						href="/request-player-access-test"
						className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
						Request player access
					</Link>
				</div>
			) : (
				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{links.map(({ player }) => (
						<article key={player.id} className="rounded-xl border p-5">
							<div className="flex items-center gap-3">
								{player.imageUrl ? (
									<img
										src={player.imageUrl}
										alt=""
										className="h-14 w-14 rounded-full object-cover"
									/>
								) : (
									<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-semibold">
										{player.firstName.charAt(0)}
										{player.lastName.charAt(0)}
									</div>
								)}
								<div>
									<h2 className="font-semibold">
										{player.firstName} {player.lastName}
									</h2>
									<p className="text-sm text-muted-foreground">Linked player</p>
								</div>
							</div>

							<Link
								href={`/players/${player.id}`}
								className="mt-5 inline-block text-sm font-medium underline underline-offset-4">
								View player profile
							</Link>
						</article>
					))}
				</div>
			)}
		</main>
	);
}
