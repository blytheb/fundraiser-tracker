import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Player } from "@prisma/client";

import { formatCurrency } from "@/lib/format";

type Props = {
	players: Player[];
	balances: Map<string, number>;
};

// Compact roster rows: initials, name, balance (red when negative).
export default function TeamRosterList({ players, balances }: Props) {
	if (players.length === 0) {
		return (
			<div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
				No players on this team yet. Use Manage roster to add some.
			</div>
		);
	}

	const sorted = [...players].sort(
		(a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName),
	);

	return (
		<ul className="divide-y overflow-hidden rounded-xl border bg-card">
			{sorted.map((player) => {
				const balance = balances.get(player.id) ?? 0;
				const initials = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();
				return (
					<li key={player.id}>
						<Link
							href={`/admin/players/${player.id}`}
							className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:px-5">
							<span
								aria-hidden="true"
								className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
								{initials}
							</span>
							<span className="min-w-0 flex-1 truncate font-medium">
								{player.firstName} {player.lastName}
								{!player.status && (
									<span className="ml-1.5 text-xs font-normal text-muted-foreground">
										(inactive)
									</span>
								)}
							</span>
							<span
								className={`shrink-0 font-semibold tabular-nums ${
									balance < 0 ? "text-destructive" : balance > 0 ? "text-green-700" : "text-muted-foreground"
								}`}
								title="Current balance">
								{formatCurrency(balance)}
							</span>
							<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
