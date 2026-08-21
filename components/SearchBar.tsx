"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchInputProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

export default function SearchInput({
	value,
	onChange,
	placeholder = "Search...",
}: SearchInputProps) {
	return (
		<div className="relative w-full">
			<Search
				className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>

			<Input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className="pl-9 pr-9"
			/>

			{value && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => onChange("")}
					className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
					aria-label="Clear search">
					<X className="size-4" />
				</Button>
			)}
		</div>
	);
}
