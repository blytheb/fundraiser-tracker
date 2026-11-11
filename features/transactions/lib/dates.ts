// Date helpers for transaction forms.

/** Parses "YYYY-MM-DD" from an <input type="date"> as midnight UTC (formatDate shows it in UTC). */
export function parseDateInput(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		throw new Error("Enter a valid date.");
	}

	const date = new Date(`${value}T00:00:00.000Z`);
	if (Number.isNaN(date.getTime())) {
		throw new Error("Enter a valid date.");
	}

	return date;
}

/** Today's date in Hawaii as "YYYY-MM-DD", for date input defaults. */
export function todayInputValue() {
	return new Date().toLocaleDateString("en-CA", {
		timeZone: "Pacific/Honolulu",
	});
}

/** A stored date as "YYYY-MM-DD" for a date input (dates are saved as midnight UTC). */
export function toDateInputValue(date: Date) {
	return date.toISOString().slice(0, 10);
}
