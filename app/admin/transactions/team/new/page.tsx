import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { TransactionDirection } from "@prisma/client";

import PageHeader from "@/components/reusable/PageHeader";
import TeamTransactionForm from "@/components/forms/transactions/TeamTransactionForm";
import { getTeamOptions } from "@/features/transactions/data/get-team-options";

type PageProps = {
	searchParams: Promise<{ direction?: string }>;
};

export default async function NewTeamTransactionPage({ searchParams }: PageProps) {
	const { direction: param } = await searchParams;
	const direction: TransactionDirection = param === "EXPENSE" ? "EXPENSE" : "INCOME";
	const teams = await getTeamOptions();

	return (
		<main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:py-8">
			<Link
				href="/admin/transactions"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft className="size-4" />
				Transactions
			</Link>

			<PageHeader
				heading={direction === "INCOME" ? "New team income" : "New team expense"}
				subheading="Enter the total, choose the teams, and split it across their players."
			/>

			<TeamTransactionForm teams={teams} defaultDirection={direction} />
		</main>
	);
}
