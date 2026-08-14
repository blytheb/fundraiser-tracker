"use client";

import React from "react";
import { CirclePlus } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
type EditTeamDialogProps = {
	team: Team;
	onEditTeam: (team: Team) => void;
	children: React.ReactNode;
};

export default function EditTeamDialog({
	team,
	onEditTeam,
	children,
}: EditTeamDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");

	function handleEdit() {}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit this team</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name">Team Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button type="button" onClick={handleEdit}>
						Edit Team
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
