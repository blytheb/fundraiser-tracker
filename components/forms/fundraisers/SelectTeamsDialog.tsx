"use client";

import { useRouter } from "next/navigation";
import { saveFundraiserTeams } from "@/features/fundraisers/actions/fundraiserTeams";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { Team } from "@prisma/client";

type SelectTeamsProps = {
	fundraiserId: string;
	selectedTeamIds: string[];
	availableTeams: Team[];
};

export default function SelectTeams({
	fundraiserId,
	selectedTeamIds,
	availableTeams,
}: SelectTeamsProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const [selectedIds, setSelectedIds] = useState<string[]>(selectedTeamIds);

	useEffect(() => {
		setSelectedIds(selectedTeamIds);
	}, [open, selectedTeamIds]);

	async function handleSave() {
		try {
			await saveFundraiserTeams(fundraiserId, selectedIds);
			setOpen(false);
			router.refresh();
		} catch (error) {
			console.error("Error saving fundraiser teams:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button>
						<Plus />
						Select Teams
					</Button>
				}
			/>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Select Teams</DialogTitle>
					<DialogDescription>
						Select the teams participating in this fundraiser.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{availableTeams.map((team) => (
						<div key={team.id} className="flex items-center space-x-2">
							<input
								type="checkbox"
								id={`team-${team.id}`}
								checked={selectedIds.includes(team.id)}
								onChange={() => {
									if (selectedIds.includes(team.id)) {
										setSelectedIds(selectedIds.filter((id) => id !== team.id));
									} else {
										setSelectedIds([...selectedIds, team.id]);
									}
								}}
							/>

							<label htmlFor={`team-${team.id}`}>{team.name}</label>
						</div>
					))}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}>
						Cancel
					</Button>

					<Button type="button" onClick={handleSave}>
						Save Teams
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
