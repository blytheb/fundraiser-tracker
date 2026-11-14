import Link from "next/link";
import PageHeader from "@/components/reusable/PageHeader";
import SearchBar from "@/components/reusable/SearchBar";
import NewTransactionMenu from "@/features/transactions/NewTransactionMenu";
import TransactionFeed from "@/features/transactions/TransactionFeed";
import TransactionKindFilter from "@/features/transactions/TransactionKindFilter";
import { getTransactionFeed } from "@/features/transactions/data/get-transaction-feed";
import { getPlayers } from "@/features/players/data/players";
import { formatCurrency } from "@/lib/format";
import { TRANSACTION_KIND_LABELS, type TransactionKind } from "@/lib/labels";

type PageProps = {
	searchParams: Promise<{ kind?: string; search?: string; status?: string }>;
};

const STATUS_FILTERS = {
	DRAFT: "Drafts",
	COMPLETED: "Final, not shared with parents yet",
	PUBLISHED: "Shared with parents",
} as const;
type StatusFilter = keyof typeof STATUS_FILTERS;

function parseStatus(value?: string): StatusFilter | undefined {
	return value && value in STATUS_FILTERS ? (value as StatusFilter) : undefined;
}

function parseKind(value?: string): TransactionKind | undefined {
	return value && value in TRANSACTION_KIND_LABELS
		? (value as TransactionKind)
		: undefined;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
	const { kind: kindParam, search, status: statusParam } = await searchParams;
	const kind = parseKind(kindParam);
	const status = parseStatus(statusParam);

	const [{ rows, totals }, players] = await Promise.all([
		getTransactionFeed({ kind, search, status }),
		getPlayers(),
	]);

	const playerOptions = players
		.filter((player) => player.status)
		.map((player) => ({
			id: player.id,
			name: `${player.firstName} ${player.lastName}`,
		}));

	return (
		<main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6 lg:py-8">
			<PageHeader
				heading="Transactions"
				subheading="All individual and team income and expenses, newest first."
				action={<NewTransactionMenu players={playerOptions} />}
			/>

			<section
				aria-label="Totals for the transactions shown"
				className="grid grid-cols-3 gap-2 sm:gap-3">
				<Total label="Income" value={totals.income} tone="text-green-700" />
				<Total label="Expenses" value={-totals.expenses} tone="text-destructive" />
				<Total
					label="Net"
					value={totals.net}
					tone={totals.net < 0 ? "text-destructive" : ""}
				/>
			</section>

			<div className="space-y-3">
				<SearchBar placeholder="Search by name, player or team..." />
				<TransactionKindFilter active={kind} search={search} />
			</div>

			{status && (
				<div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
					<span>
						Showing: <span className="font-medium">{STATUS_FILTERS[status]}</span>
					</span>
					<Link href="/admin/transactions" className="font-medium underline underline-offset-4">
						Clear
					</Link>
				</div>
			)}

			<div className="flex items-baseline justify-between text-sm text-muted-foreground">
				<span>
					{rows.length} {rows.length === 1 ? "transaction" : "transactions"}
				</span>
				<span>Totals exclude drafts</span>
			</div>

			<TransactionFeed rows={rows} players={playerOptions} />
		</main>
	);
}

function Total({ label, value, tone }: { label: string; value: number; tone: string }) {
	return (
		<div className="rounded-xl border bg-card p-3 sm:p-4">
			<p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
			<p className={`mt-1 truncate text-base font-semibold tabular-nums sm:text-xl ${tone}`}>
				{formatCurrency(value)}
			</p>
		</div>
	);
}
