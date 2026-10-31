"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Fundraiser, Team, AllocationStatus } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";

import FundraiserActions from "@/features/fundraisers/FundraiserActions";
import ContributionActions from "@/features/fundraisers/ContributionActions";
import AddContribution from "@/components/forms/fundraisers/AddContribution";
import SelectFundraiserRoster from "@/components/forms/fundraisers/SelectFundraiserRoster";

import { setCustomDistribution } from "@/features/fundraisers/actions/set-custom-distribution";
import type {
	FundraiserParticipantWithPlayer,
	FundraiserContributionListItem,
} from "@/features/fundraisers/types";
import type { TeamWithPlayers } from "@/features/teams/types";

type FundraiserWorkspaceProps = {
	fundraiser: Fundraiser;
	teams: Team[];
	participants: FundraiserParticipantWithPlayer[];
	contributions: FundraiserContributionListItem[];
	financialSummary: {
		totalRaised: number;
		currentlyAllocated: number;
		availableToAllocate: number;
		participantCount: number;
	};
	activeAllocations: {
		id: string;
		fundraiserParticipantId: string;
		amount: number;
		status: AllocationStatus;
	}[];
	activeTeams: Team[];
	activeTeamsWithPlayers: TeamWithPlayers[];
};

export default function FundraiserWorkspace({
	fundraiser,
	teams,
	participants,
	contributions,
	financialSummary,
	activeAllocations,
	activeTeams,
	activeTeamsWithPlayers,
}: FundraiserWorkspaceProps) {
	const router = useRouter();
	const [contributionsOpen, setContributionsOpen] = useState(false);
	const [amounts, setAmounts] = useState<Record<string, string>>({});
	const [isPending, startTransition] = useTransition();

	const allocatedByParticipant = activeAllocations.reduce((map, allocation) => {
		const current = map.get(allocation.fundraiserParticipantId) ?? 0;
		map.set(allocation.fundraiserParticipantId, current + allocation.amount);
		return map;
	}, new Map<string, number>());

	useEffect(() => {
		const initialAmounts: Record<string, string> = {};

		participants.forEach((participant) => {
			initialAmounts[participant.id] = (
				allocatedByParticipant.get(participant.id) ?? 0
			).toFixed(2);
		});

		setAmounts(initialAmounts);
	}, [participants, activeAllocations]);

	const allocationTotal = participants.reduce(
		(total, participant) => total + (Number(amounts[participant.id]) || 0),
		0,
	);

	const remainingToAllocate = financialSummary.totalRaised - allocationTotal;

	const sourceLabels = {
		EVENT_PROFIT: "Event Profit",
		SALES: "Sales",
		TIPS: "Tips",
		OTHER: "Other",
	};

	async function handleSaveDistribution() {
		startTransition(async () => {
			const allocations = participants.map((participant) => ({
				participantId: participant.id,
				amount: Number(amounts[participant.id] || 0),
			}));

			try {
				await setCustomDistribution(fundraiser.id, allocations);
				router.refresh();
			} catch (error) {
				console.error(error);
			}
		});
	}

	function handleEqualDistribution() {
		const totalCents = Math.round(financialSummary.totalRaised * 100);
		const participantCount = participants.length;

		if (participantCount === 0) return;

		const centsPerParticipant = Math.floor(totalCents / participantCount);
		const remainder = totalCents % participantCount;
		const equalAmounts: Record<string, string> = {};

		participants.forEach((participant, index) => {
			const cents = centsPerParticipant + (index < remainder ? 1 : 0);
			equalAmounts[participant.id] = (cents / 100).toFixed(2);
		});

		setAmounts(equalAmounts);
	}

	return (
		<main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
			{/* Fundraiser overview */}
			<Card>
				<CardContent className="p-6">
					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0 space-y-3">
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="secondary">
									{fundraiser.status === "DRAFT"
										? "Draft"
										: fundraiser.status === "COMPLETED"
											? "Completed"
											: "Published"}
								</Badge>

								{teams.map((team) => (
									<Badge key={team.id} variant="outline">
										{team.name}
									</Badge>
								))}
							</div>

							<div>
								<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
									{fundraiser.name}
								</h1>
								{fundraiser.description && (
									<p className="mt-2 text-muted-foreground">
										{fundraiser.description}
									</p>
								)}
							</div>

							<p className="text-sm text-muted-foreground">
								Event date: {fundraiser.startDate.toLocaleDateString()}
							</p>

							<div className="flex flex-wrap items-center gap-2">
								{participants.slice(0, 6).map((participant) => (
									<Avatar key={participant.id} className="size-10">
										<AvatarImage
											src={
												participant.player.imageUrl ??
												`https://robohash.org/${participant.player.id}?set=set2`
											}
											alt={`${participant.player.firstName} ${participant.player.lastName}`}
										/>
										<AvatarFallback>
											{participant.player.firstName[0].toUpperCase()}
											{participant.player.lastName[0].toUpperCase()}
										</AvatarFallback>
									</Avatar>
								))}
								{participants.length > 6 && (
									<span className="text-sm text-muted-foreground">
										+{participants.length - 6} more
									</span>
								)}
								<span className="text-sm text-muted-foreground">
									{participants.length} participants
								</span>
							</div>
						</div>

						<FundraiserActions fundraiser={fundraiser} />
					</div>
				</CardContent>
			</Card>

			{/* Finanncial summary */}
			<section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<Card>
					<CardContent className="p-5">
						<p className="text-sm text-muted-foreground">Total raised</p>
						<p className="mt-2 text-2xl font-bold tabular-nums">
							{financialSummary.totalRaised.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
							})}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-5">
						<p className="text-sm text-muted-foreground">Total allocated</p>
						<p className="mt-2 text-2xl font-bold tabular-nums">
							{allocationTotal.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
							})}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-5">
						<p className="text-sm text-muted-foreground">
							{fundraiser.status !== "DRAFT"
								? "Allocation status"
								: "Remaining to allocate"}
						</p>
						<p className="mt-2 text-2xl font-bold tabular-nums">
							{fundraiser.status !== "DRAFT"
								? "Finalized"
								: remainingToAllocate.toLocaleString("en-US", {
										style: "currency",
										currency: "USD",
									})}
						</p>
					</CardContent>
				</Card>
			</section>

			{/* Contributions */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-4">
						<div>
							<CardTitle>Contributions</CardTitle>
							<p className="mt-1 text-sm text-muted-foreground">
								Track the income generated by this fundraiser.
							</p>
						</div>
						{fundraiser.status === "DRAFT" && (
							<AddContribution fundraiserId={fundraiser.id} />
						)}
					</div>
				</CardHeader>

				<CardContent>
					<Collapsible
						open={contributionsOpen}
						onOpenChange={setContributionsOpen}
						className="space-y-3">
						<div className="flex items-center justify-between rounded-lg border p-4">
							<div>
								<p className="font-medium">Income sources</p>
								<p className="text-sm text-muted-foreground">
									{contributions.length} contributions
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setContributionsOpen(!contributionsOpen)}
								aria-label={
									contributionsOpen
										? "Hide contributions"
										: "Show contributions"
								}>
								<ChevronsUpDown className="size-4" />
							</Button>
						</div>

						<CollapsibleContent className="space-y-2">
							{contributions.map((contribution) => (
								<div
									key={contribution.id}
									className="flex items-center justify-between gap-3 rounded-lg border p-3">
									<div>
										<p className="font-medium">
											{sourceLabels[contribution.source]}
										</p>
										<p className="text-sm text-muted-foreground">
											{contribution.amount.toLocaleString("en-US", {
												style: "currency",
												currency: "USD",
											})}
										</p>
									</div>

									{fundraiser.status === "DRAFT" && (
										<ContributionActions contribution={contribution} />
									)}
								</div>
							))}

							{contributions.length === 0 && (
								<p className="py-6 text-center text-sm text-muted-foreground">
									No contributions recorded yet.
								</p>
							)}
						</CollapsibleContent>
					</Collapsible>
				</CardContent>
			</Card>

			{/* Player allocations */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-4">
						<div>
							<CardTitle>Player allocations</CardTitle>
							<p className="mt-1 text-sm text-muted-foreground">
								{participants.length} participants · Distribute the funds
								raised.
							</p>
						</div>

						{fundraiser.status === "DRAFT" && (
							<SelectFundraiserRoster
								fundraiserId={fundraiser.id}
								selectedTeamIds={teams.map((team) => team.id)}
								selectedParticipantIds={participants.map(
									(participant) => participant.playerId,
								)}
								availableTeams={activeTeams}
								availableRosters={activeTeamsWithPlayers}
							/>
						)}
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="grid grid-cols-[1fr_120px] gap-3 border-b pb-2 text-sm font-medium text-muted-foreground">
						<span>Player</span>
						<span className="text-right">Allocation</span>
					</div>

					{participants.map((participant) => (
						<div
							key={participant.id}
							className="grid grid-cols-[1fr_120px] items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
							<div className="flex min-w-0 items-center gap-3">
								<Avatar className="size-10">
									<AvatarImage
										src={
											participant.player.imageUrl ??
											`https://robohash.org/${participant.player.id}?set=set2`
										}
										alt={`${participant.player.firstName} ${participant.player.lastName}`}
									/>
									<AvatarFallback>
										{participant.player.firstName[0].toUpperCase()}
										{participant.player.lastName[0].toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<p className="truncate font-medium">
									{participant.player.firstName} {participant.player.lastName}
								</p>
							</div>

							{fundraiser.status === "DRAFT" ? (
								<Input
									type="number"
									min="0"
									step="0.01"
									value={amounts[participant.id] ?? ""}
									onChange={(event) =>
										setAmounts((previous) => ({
											...previous,
											[participant.id]: event.target.value,
										}))
									}
									className="text-right tabular-nums"
									aria-label={`Allocation for ${participant.player.firstName} ${participant.player.lastName}`}
								/>
							) : (
								<p className="text-right font-medium tabular-nums">
									{(
										allocatedByParticipant.get(participant.id) ?? 0
									).toLocaleString("en-US", {
										style: "currency",
										currency: "USD",
									})}
								</p>
							)}
						</div>
					))}

					{participants.length === 0 && (
						<p className="py-6 text-center text-sm text-muted-foreground">
							Add participants to start allocating funds.
						</p>
					)}

					{fundraiser.status === "DRAFT" && (
						<div className="space-y-3 border-t pt-4">
							<div className="ml-auto max-w-sm space-y-2">
								<div className="flex justify-between gap-4 text-sm">
									<span className="text-muted-foreground">Total raised</span>
									<span className="font-medium tabular-nums">
										{financialSummary.totalRaised.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
										})}
									</span>
								</div>
								<div className="flex justify-between gap-4 text-sm">
									<span className="text-muted-foreground">Allocated</span>
									<span className="font-medium tabular-nums">
										{allocationTotal.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
										})}
									</span>
								</div>
								<div className="flex justify-between gap-4 border-t pt-2">
									<span className="font-semibold">Remaining</span>
									<span className="font-semibold tabular-nums">
										{remainingToAllocate.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
										})}
									</span>
								</div>
							</div>

							{Math.abs(remainingToAllocate) > 0.001 && (
								<p className="text-right text-sm text-destructive">
									{remainingToAllocate > 0
										? "Some funds still need to be allocated."
										: "Allocations exceed the amount raised."}
								</p>
							)}

							<div className="flex flex-wrap justify-end gap-2">
								<Button
									variant="outline"
									onClick={handleEqualDistribution}
									disabled={participants.length === 0}>
									Equal split
								</Button>
								<Button
									onClick={handleSaveDistribution}
									disabled={
										isPending ||
										participants.length === 0 ||
										Math.abs(remainingToAllocate) > 0.001
									}>
									{isPending ? "Saving..." : "Save allocations"}
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
