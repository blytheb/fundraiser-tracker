"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import IndividualTransactionDialog from "@/components/forms/transactions/IndividualTransactionDialog";
import type { IndividualEditData } from "@/features/transactions/data/get-transaction-feed";

type PlayerOption = { id: string; name: string };

const OpenEditContext = createContext<(transaction: IndividualEditData) => void>(() => {});

// One edit dialog for the whole list; rows call open(transaction).
export function IndividualEditProvider({
	players,
	children,
}: {
	players: PlayerOption[];
	children: ReactNode;
}) {
	const [editing, setEditing] = useState<IndividualEditData | null>(null);

	return (
		<OpenEditContext.Provider value={setEditing}>
			{children}
			<IndividualTransactionDialog
				open={editing !== null}
				onOpenChange={(open) => !open && setEditing(null)}
				players={players}
				transaction={editing ?? undefined}
			/>
		</OpenEditContext.Provider>
	);
}

// A list row that opens the edit dialog for its individual transaction.
export function IndividualRowButton({
	transaction,
	className,
	children,
}: {
	transaction: IndividualEditData;
	className: string;
	children: ReactNode;
}) {
	const open = useContext(OpenEditContext);

	return (
		<button
			type="button"
			onClick={() => open(transaction)}
			className={`w-full text-left ${className}`}>
			{children}
		</button>
	);
}
