import Link from "next/link";
import { TRANSACTION_KIND_LABELS, type TransactionKind } from "@/lib/labels";

const OPTIONS: { value: TransactionKind | null; label: string }[] = [
	{ value: null, label: "All" },
	...(Object.entries(TRANSACTION_KIND_LABELS) as [TransactionKind, string][]).map(
		([value, label]) => ({ value, label }),
	),
];

// Filter chips as links, so the filter lives in the URL (?kind=...) and works without JS.
// Scrolls sideways on narrow screens instead of wrapping.
export default function TransactionKindFilter({
	active,
	search,
}: {
	active?: TransactionKind;
	search?: string;
}) {
	return (
		<nav aria-label="Filter by kind" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
			<ul className="flex w-max gap-2">
				{OPTIONS.map((option) => {
					const params = new URLSearchParams();
					if (option.value) params.set("kind", option.value);
					if (search) params.set("search", search);
					const query = params.toString();
					const isActive = (active ?? null) === option.value;

					return (
						<li key={option.label}>
							<Link
								href={query ? `/admin/transactions?${query}` : "/admin/transactions"}
								aria-current={isActive ? "page" : undefined}
								className={`inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium whitespace-nowrap transition-colors ${
									isActive
										? "border-primary bg-primary text-primary-foreground"
										: "bg-background hover:bg-muted"
								}`}>
								{option.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
