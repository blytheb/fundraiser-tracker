"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
	addTeamToFundraiser,
	createFundraiserAndAddToTeam,
} from "@/features/fundraisers/actions/fundraiserTeams";

import type { Fundraiser } from "@prisma/client";

type DialogProps = {
	teamId: string;
	availableFundraisers: Fundraiser[];
};

export default function AddFundraiserToTeamDialog({
	teamId,
	availableFundraisers,
}: DialogProps) {
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [mode, setMode] = useState<"existing" | "create">("existing");

	const [name, setName] = useState("");

	const filtered = availableFundraisers.filter((fundraiser) => {
		const searchText = fundraiser.name.toLowerCase();

		return searchText.includes(search.toLowerCase());
	});

	async function handleAdd(fundraiserId: string) {
		try {
			await addTeamToFundraiser(fundraiserId, teamId);

			router.refresh();
			setSearch("");
			setOpen(false);
		} catch (error) {
			console.error("Failed to add fundraiser to team:", error);
		}
	}

	async function handleCreate() {
		try {
			await createFundraiserAndAddToTeam(teamId, {
				name: name.trim(),
			});

			router.refresh();

			setName("");
			setMode("existing");
			setOpen(false);
		} catch (error) {
			console.error("Failed to create fundraiser:", error);
		}
	}

	function handleOpenChange(value: boolean) {
		setOpen(value);

		if (!value) {
			setSearch("");
			setName("");
			setMode("existing");
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger render={<Button>Add Fundraiser</Button>}></DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Fundraiser to Team</DialogTitle>
				</DialogHeader>

				{mode === "existing" ? (
					<div className="space-y-4">
						<Input
							placeholder="Search fundraisers..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>

						<div className="max-h-64 overflow-y-auto rounded-md border">
							{search.length === 0 ? (
								<div className="p-4 text-sm text-muted-foreground">
									Search for an existing fundraiser
								</div>
							) : filtered.length === 0 ? (
								<div className="p-4 text-sm text-muted-foreground">
									No fundraisers found
								</div>
							) : (
								filtered.map((fundraiser) => (
									<div
										key={fundraiser.id}
										className="flex items-center justify-between border-b p-3 last:border-b-0">
										<span>{fundraiser.name}</span>

										<Button size="sm" onClick={() => handleAdd(fundraiser.id)}>
											Add
										</Button>
									</div>
								))
							)}
						</div>

						<div className="border-t pt-4">
							<Button
								variant="outline"
								className="w-full"
								onClick={() => setMode("create")}>
								+ Create New Player
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<Input
							placeholder="First name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>

						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setMode("existing")}>
								Back
							</Button>

							<Button
								className="flex-1"
								onClick={handleCreate}
								disabled={!name.trim()}>
								Create & Add
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
