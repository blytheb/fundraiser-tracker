import React from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import FundraiserActions from "@/components/fundraiser/FundraiserActions";

type FundraiserRowProps = {
	fundraiser: Fundrlaiser;
};

export default function FundraiserRow({ fundraiser }: FundraiserRowProps) {
	return (
		<TableRow>
			<TableCell>{fundraiser.startDate.toLocaleDateString()}</TableCell>
			<TableCell>
				<Badge variant="secondary">{fundraiser.status}</Badge>
			</TableCell>
			<TableCell>
				<Link
					href={`/test/${fundraiser.id}`}
					className="font-medium hover:underline">
					{fundraiser.name}
				</Link>
			</TableCell>
			<TableCell>All Teams</TableCell>
			<TableCell>${fundraiser.amount}</TableCell>
			<TableCell>
				<FundraiserActions fundraiser={fundraiser} />
			</TableCell>
		</TableRow>
	);
}
