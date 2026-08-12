import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
	TableCell,
	TableRow,
} from "@/components/ui/table";

type FundraiserRowProps = {
	fundraiser: Fundrlaiser;
}

export default function FundraiserRow({fundraiser}: FundraiserRowProps) {
  return (
		<TableRow>
			<TableCell>{fundraiser.startDate.toLocaleDateString()}</TableCell>
			<TableCell>
				<Badge variant="secondary">{fundraiser.status}</Badge>
			</TableCell>
			<TableCell>{fundraiser.name}</TableCell>
			<TableCell>All Teams</TableCell>
			<TableCell>
				<div className="flex justify-end gap-1">
					<Button variant="ghost" size="icon">
						<Eye />
					</Button>

					<Button variant="ghost" size="icon">
						<Pencil />
					</Button>

					<Button variant="ghost" size="icon">
						<Trash2 />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}
