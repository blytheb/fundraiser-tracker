import React from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import FundraiserActions from "@/features/fundraisers/FundraiserActions";
import type { Fundraiser } from "@prisma/client";

type FundraiserRowProps = {
	fundraiser: Fundraiser;
};

export default function FundraiserRow({ fundraiser }: FundraiserRowProps) {
	return (
		<TableRow>
			<TableCell>{fundraiser.startDate.toLocaleDateString()}</TableCell>
			<TableCell>
				{/* <Badge variant="secondary">{fundraiser.status}</Badge> */}
			</TableCell>
			<TableCell>
				<Link
					href={`/fundraisers/${fundraiser.id}`}
					className="font-medium hover:underline">
					{fundraiser.name}
				</Link>
			</TableCell>
			<TableCell>All Teams</TableCell>
			<TableCell>
				<FundraiserActions fundraiser={fundraiser} />
			</TableCell>
		</TableRow>
	);
}
