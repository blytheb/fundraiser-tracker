"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SearchBarProps = {
	placeholder?: string;
};

export default function SearchBar({
	placeholder = "Search...",
}: SearchBarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const value = searchParams.get("search") ?? "";

	function handleSearch(value: string) {
		const params = new URLSearchParams(searchParams.toString());

		if (value) {
			params.set("search", value);
		} else {
			params.delete("search");
		}

		router.replace(`${pathname}?${params.toString()}`);
	}

	function clearSearch() {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("search");
		router.replace(`${pathname}?${params.toString()}`);
	}
	return (
		<div className="relative w-full">
			<Search
				className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>

			<Input
				value={value}
				onChange={(event) => handleSearch(event.target.value)}
				placeholder={placeholder}
				className="pl-9 pr-9"
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
