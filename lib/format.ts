// Shared display formatting. Safe to import from server and client components.

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

// Accepts a number or a Prisma.Decimal (anything with toNumber()),
// so server code doesn't need to convert first.
export function formatCurrency(amount: number | { toNumber(): number }) {
	return currencyFormatter.format(
		typeof amount === "number" ? amount : amount.toNumber(),
	);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	// Fixed time zone so server and browser render the same text (no hydration
	// mismatch), and date-only values saved as midnight UTC don't show as the
	// previous day in Hawaii.
	timeZone: "UTC",
});

// e.g. "Nov 6, 2026"
export function formatDate(date: Date | string) {
	return dateFormatter.format(typeof date === "string" ? new Date(date) : date);
}
