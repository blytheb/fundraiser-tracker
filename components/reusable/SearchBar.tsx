"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SearchBarProps = {
	placeholder?: string;
	paramName?: string;
};

export default function SearchBar({
	placeholder = "Search...",
	paramName = "search",
}: SearchBarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const queryValue = searchParams.get(paramName) ?? "";
	const [value, setValue] = useState("");

	useEffect(() => {
		if (value === queryValue) return;

		const timeout = setTimeout(() => {
			const params = new URLSearchParams(searchParams.toString());

			if (value.trim()) {
				params.set(paramName, value.trim());
			} else {
				params.delete(paramName);
			}

			const query = params.toString();
			router.replace(query ? `${pathname}?${query}` : pathname);
		}, 300);

		return () => clearTimeout(timeout);
	}, [value, queryValue, paramName, pathname, router, searchParams]);

	function clearSearch() {
		setValue("");
	}

	return (
		<div className="relative w-full">
			<Search
				className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>

			<Input
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder={placeholder}
				className="pl-9 pr-9"
				aria-label={placeholder}
			/>

			{value && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={clearSearch}
					className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
					aria-label="Clear search">
					<X className="size-4" />
				</Button>
			)}
		</div>
	);
}
