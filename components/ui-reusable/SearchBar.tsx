"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SearchBarProps = {
	placeholder?: string;
};

export default function SearchBar({
	placeholder = "Search...",
}: SearchBarProps) {
	const router = useRouter();
	const pathname = usePathname();

	const [value, setValue] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => {
			const params = new URLSearchParams();

			if (value) {
				params.set("search", value);
			}

			const query = params.toString();

			router.replace(query ? `${pathname}?${query}` : pathname);
		}, 300);

		return () => clearTimeout(timeout);
	}, [value, pathname, router]);

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
