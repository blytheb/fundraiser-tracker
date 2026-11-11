import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import PageHeader from "@/components/reusable/PageHeader";
import TeamTransactionForm from "@/components/forms/transactions/TeamTransactionForm";
import { getTeamTransaction } from "@/features/transactions/data/get-team-transaction";
import { getTeamOptions } from "@/features/transactions/data/get-team-options";
import { toDateInputValue } from "@/features/transactions/lib/dates";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditTeamTransactionPage({ params }: PageProps) {
	const { id } = await params;
	const teamTransaction = await getTeamTransaction(id);

	if (!teamTransaction) notFound();

	// only drafts can be edited; reopen a completed one first
	if (teamTransaction.status !== "DRAFT") {
		redirect(`/admin/transactions/team/${id}`);
	}

	const teams = await getTeamOptions(teamTransaction.teams.map((t) => t.id));

	return (
		<main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:py-8">
			<Link
				href={`/admin/transactions/team/${id}`}
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft className="size-4" />
				{teamTransaction.name}
			</Link>

			<PageHeader heading="Edit team transaction" />

			<TeamTransactionForm
				teams={teams}
				defaultDirection={teamTransaction.direction}
				initial={{
					id: teamTransaction.id,
					name: teamTransaction.name,
					description: teamTransaction.description,
					date: toDateInputValue(teamTransaction.date),
					direction: teamTransaction.direction,
					paymentMethod: teamTransaction.paymentMethod,
					total: teamTransaction.total,
					teamIds: teamTransaction.teams.map((t) => t.id),
					shares: teamTransaction.shares,
				}}
			/>
		</main>
	);
}
