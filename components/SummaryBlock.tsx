import React from 'react'

type SummaryBlockProps = {
    value: number;
    label: string;
}

export default function SummaryBlock({
    value,
    label
}: SummaryBlockProps ) {
  return (
		<div className="mb-6 flex items-center gap-4 border p-4">
            <div className="flex flex-col justify-center items-center gap-3">
                <h1 className="text-2xl font-bold">{value}</h1>
                <p className="text-muted-foreground">{label}</p>
            </div>
		</div>
	);
}
