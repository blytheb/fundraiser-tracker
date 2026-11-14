"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import type { TransactionDirection } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TransactionKindIcon from "@/components/reusable/TransactionKindIcon";
import IndividualTransactionDialog from "@/components/forms/transactions/IndividualTransactionDialog";

type PlayerOption = { id: string; name: string };

// "New transaction" button: individual ones open a quick dialog,
// team ones go to the full form page (teams, players and the split need room).
export default function NewTransactionMenu({ players }: { players: PlayerOption[] }) {
	const router = useRouter();
	const [individualDirection, setIndividualDirection] =
		useState<TransactionDirection | null>(null);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button className="w-full sm:w-auto">
							<Plus />
							New transaction
							<ChevronDown className="opacity-70" />
						</Button>
					}
				/>
				<DropdownMenuContent align="end" className="w-64">
					{/* Base UI: a label must be inside a group */}
					<DropdownMenuGroup>
						<DropdownMenuLabel>Individual (one player)</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => setIndividualDirection("INCOME")}>
							<TransactionKindIcon kind="INDIVIDUAL_INCOME" className="size-7" />
							Individual income
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setIndividualDirection("EXPENSE")}>
							<TransactionKindIcon kind="INDIVIDUAL_EXPENSE" className="size-7" />
							Individual expense
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					<DropdownMenuGroup>
						<DropdownMenuLabel>Team (split across players)</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => router.push("/admin/transactions/team/new?direction=INCOME")}>
							<TransactionKindIcon kind="TEAM_INCOME" className="size-7" />
							Team income
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => router.push("/admin/transactions/team/new?direction=EXPENSE")}>
							<TransactionKindIcon kind="TEAM_EXPENSE" className="size-7" />
							Team expense
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<IndividualTransactionDialog
				open={individualDirection !== null}
				onOpenChange={(open) => !open && setIndividualDirection(null)}
				initialDirection={individualDirection ?? "INCOME"}
				players={players}
			/>
		</>
	);
}
