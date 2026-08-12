import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {Eye, Pencil, Trash2 } from "lucide-react";

export default function PlayerTable() {
  return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>First Name</TableHead>
						<TableHead>Last Name</TableHead>
						<TableHead>Teams</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>John</TableCell>
						<TableCell>Doe</TableCell>
						<TableCell>
							<div className="flex gap-1">
								<Badge variant="secondary">18U Girls</Badge>

								<Badge variant="secondary">16U Girls</Badge>
							</div>
						</TableCell>
						<TableCell className="text-right">
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
					</TableRow>{" "}
					<TableRow>
						<TableCell>John</TableCell>
						<TableCell>Doe</TableCell>
						<TableCell>
							<div className="flex gap-1">
								<Badge variant="secondary">18U Girls</Badge>

								<Badge variant="secondary">16U Girls</Badge>
							</div>
						</TableCell>
						<TableCell className="text-right">
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
					<TableRow>
						<TableCell>John</TableCell>
						<TableCell>Doe</TableCell>
						<TableCell>
							<div className="flex gap-1">
								<Badge variant="secondary">18U Girls</Badge>

								<Badge variant="secondary">16U Girls</Badge>
							</div>
						</TableCell>
						<TableCell className="text-right">
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
				</TableBody>
			</Table>
		</>
	);
}
