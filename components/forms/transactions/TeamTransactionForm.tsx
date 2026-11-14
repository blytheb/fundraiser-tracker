"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Users } from "lucide-react";
import type { PaymentMethod, TransactionDirection } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import DirectionToggle from "@/components/forms/transactions/DirectionToggle";
import { saveTeamTransaction } from "@/features/transactions/actions/save-team-transaction";
import { todayInputValue } from "@/features/transactions/lib/dates";
import type { TeamOption } from "@/features/transactions/data/get-team-options";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/labels";

export type TeamTransactionFormInitial = {
	id: string;
	name: string;
	description: string | null;
	date: string; // YYYY-MM-DD
	direction: TransactionDirection;
	paymentMethod: PaymentMethod;
	total: number;
	teamIds: string[];
	shares: { playerId: string; name: string; amount: number }[];
};

type Props = {
	teams: TeamOption[];
	defaultDirection: TransactionDirection;
	defaultTeamIds?: string[]; // new transaction started from a team page
	initial?: TeamTransactionFormInitial; // set when editing a draft
};

type PlayerRow = { id: string; name: string };

const toCents = (value: string) => {
	const number = Number(value);
	return Number.isFinite(number) ? Math.round(number * 100) : 0;
};

export default function TeamTransactionForm({
	teams,
	defaultDirection,
	defaultTeamIds = [],
	initial,
}: Props) {
	const router = useRouter();

	const [direction, setDirection] = useState(initial?.direction ?? defaultDirection);
	const [name, setName] = useState(initial?.name ?? "");
	const [description, setDescription] = useState(initial?.description ?? "");
	const [date, setDate] = useState(initial?.date ?? todayInputValue());
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
		initial?.paymentMethod ?? "CASH",
	);
	const [totalInput, setTotalInput] = useState(
		initial ? initial.total.toFixed(2) : "",
	);
	const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(
		initial?.teamIds ?? defaultTeamIds,
	);
	const [excluded, setExcluded] = useState<Set<string>>(() => new Set());

	// Players saved on a draft who aren't on a selected team's current roster stay listed.
	const [extraPlayers] = useState<PlayerRow[]>(() => {
		if (!initial) return [];
		const onRosters = new Set(
			teams
				.filter((team) => initial.teamIds.includes(team.id))
				.flatMap((team) => team.players.map((p) => p.id)),
		);
		return initial.shares
			.filter((share) => !onRosters.has(share.playerId))
			.map((share) => ({ id: share.playerId, name: share.name }));
	});

	// null = split equally (calculated); otherwise amounts the admin typed
	const [customAmounts, setCustomAmounts] = useState<Record<string, string> | null>(() =>
		initial
			? Object.fromEntries(initial.shares.map((s) => [s.playerId, s.amount.toFixed(2)]))
			: null,
	);

	const [error, setError] = useState("");
	const [saving, setSaving] = useState<"draft" | "complete" | null>(null);

	// --- derived values (no effects needed) ---
	const players: PlayerRow[] = [];
	const seen = new Set<string>();
	for (const team of teams.filter((t) => selectedTeamIds.includes(t.id))) {
		for (const player of team.players) {
			if (!seen.has(player.id)) {
				seen.add(player.id);
				players.push(player);
			}
		}
	}
	for (const player of extraPlayers) {
		if (!seen.has(player.id)) {
			seen.add(player.id);
			players.push(player);
		}
	}

	const included = players.filter((player) => !excluded.has(player.id));
	const totalCents = toCents(totalInput);

	// equal split in cents; the first few players absorb the leftover cents
	const equalCents = new Map<string, number>();
	if (included.length > 0) {
		const base = Math.floor(totalCents / included.length);
		const remainder = totalCents % included.length;
		included.forEach((player, index) => {
			equalCents.set(player.id, base + (index < remainder ? 1 : 0));
		});
	}

	const amountFor = (playerId: string) =>
		customAmounts
			? (customAmounts[playerId] ?? "0.00")
			: ((equalCents.get(playerId) ?? 0) / 100).toFixed(2);

	const sharedCents = included.reduce((sum, player) => sum + toCents(amountFor(player.id)), 0);
	const remainingCents = totalCents - sharedCents;
	const isBalanced = totalCents > 0 && remainingCents === 0 && included.length > 0;

	// --- handlers ---
	function toggleTeam(teamId: string) {
		setSelectedTeamIds((current) =>
			current.includes(teamId)
				? current.filter((id) => id !== teamId)
				: [...current, teamId],
		);
	}

	function togglePlayer(playerId: string, checked: boolean) {
		setExcluded((current) => {
			const next = new Set(current);
			if (checked) next.delete(playerId);
			else next.add(playerId);
			return next;
		});
	}

	function setAmount(playerId: string, value: string) {
		setCustomAmounts((current) => {
			// first edit: freeze the equal split so other amounts don't move
			const base =
				current ?? Object.fromEntries(players.map((p) => [p.id, amountFor(p.id)]));
			return { ...base, [playerId]: value };
		});
	}

	async function save(complete: boolean) {
		setError("");

		if (!name.trim()) return setError("Enter a name.");
		if (totalCents <= 0) return setError("Enter a total greater than $0.");
		if (included.length === 0) return setError("Choose at least one player.");
		if (complete && !isBalanced) {
			return setError("Player shares must add up to the total before finalizing.");
		}

		setSaving(complete ? "complete" : "draft");
		const result = await saveTeamTransaction({
			id: initial?.id,
			name,
			description,
			date,
			direction,
			paymentMethod,
			total: totalCents / 100,
			teamIds: selectedTeamIds,
			shares: included.map((player) => ({
				playerId: player.id,
				amount: toCents(amountFor(player.id)) / 100,
			})),
			complete,
		});
		setSaving(null);

		if (!result.ok) {
			setError(result.error);
			toast.error(result.error);
			return;
		}

		toast.success(complete ? "Finalized: counted in balances" : "Draft saved");
		router.push(`/admin/transactions/team/${result.data.id}`);
		router.refresh();
	}

	const kindLabel = direction === "INCOME" ? "income" : "expense";

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				save(true);
			}}
			className="space-y-5">
			{/* Details */}
			<Card>
				<CardHeader>
					<CardTitle>Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<DirectionToggle value={direction} onChange={setDirection} />

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor="team-name">Name</Label>
							<Input
								id="team-name"
								placeholder={
									direction === "INCOME" ? "e.g. Car wash" : "e.g. Tournament fee"
								}
								value={name}
								onChange={(event) => setName(event.target.value)}
								maxLength={120}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="team-total">Total amount</Label>
							<Input
								id="team-total"
								type="number"
								inputMode="decimal"
								min="0.01"
								step="0.01"
								placeholder="0.00"
								value={totalInput}
								onChange={(event) => setTotalInput(event.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="team-date">Date</Label>
							<Input
								id="team-date"
								type="date"
								value={date}
								onChange={(event) => setDate(event.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="team-payment">Payment method</Label>
							<Select
								items={PAYMENT_METHOD_LABELS}
								value={paymentMethod}
								onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
								<SelectTrigger id="team-payment" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="team-description">Note (optional)</Label>
							<Input
								id="team-description"
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								maxLength={200}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Teams */}
			<Card>
				<CardHeader>
					<CardTitle>Teams</CardTitle>
					<p className="text-sm text-muted-foreground">
						Choose the teams this {kindLabel} is for. Their players are added below.
					</p>
				</CardHeader>
				<CardContent>
					{teams.length === 0 ? (
						<p className="text-sm text-muted-foreground">No active teams.</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{teams.map((team) => {
								const selected = selectedTeamIds.includes(team.id);
								return (
									<button
										key={team.id}
										type="button"
										aria-pressed={selected}
										onClick={() => toggleTeam(team.id)}
										className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
											selected
												? "border-primary bg-primary text-primary-foreground"
												: "bg-background hover:bg-muted"
										}`}>
										{selected && <Check className="size-4" />}
										{team.name}
										<span className={selected ? "opacity-80" : "text-muted-foreground"}>
											· {team.players.length}
										</span>
									</button>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Players & split */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-3">
						<div>
							<CardTitle>Players &amp; split</CardTitle>
							<p className="mt-1 text-sm text-muted-foreground">
								{included.length} of {players.length} players included
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setCustomAmounts(null)}
							disabled={included.length === 0}>
							Split equally
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{players.length === 0 ? (
						<div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
							<Users className="mx-auto mb-2 size-6" />
							Choose a team to add its players.
						</div>
					) : (
						<ul className="divide-y rounded-lg border">
							{players.map((player) => {
								const isIncluded = !excluded.has(player.id);
								const inputId = `share-${player.id}`;
								return (
									<li key={player.id} className="flex items-center gap-3 px-3 py-2">
										<Checkbox
											checked={isIncluded}
											onCheckedChange={(checked) => togglePlayer(player.id, checked)}
											aria-label={`Include ${player.name}`}
										/>
										<label
											htmlFor={inputId}
											className={`min-w-0 flex-1 truncate text-sm ${
												isIncluded ? "font-medium" : "text-muted-foreground line-through"
											}`}>
											{player.name}
										</label>
										<div className="relative w-28 shrink-0">
											<span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
												$
											</span>
											<Input
												id={inputId}
												type="number"
												inputMode="decimal"
												min="0"
												step="0.01"
												value={isIncluded ? amountFor(player.id) : ""}
												onChange={(event) => setAmount(player.id, event.target.value)}
												disabled={!isIncluded}
												className="pl-6 text-right tabular-nums"
												aria-label={`Share for ${player.name}`}
											/>
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</CardContent>
			</Card>

			{/* Totals and actions: pinned to the bottom of the screen while scrolling */}
			<div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:mx-0 sm:rounded-xl sm:border sm:px-5">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<dl className="grid grid-cols-3 gap-2 text-sm md:flex md:gap-6">
						<div>
							<dt className="text-xs text-muted-foreground">Total</dt>
							<dd className="font-semibold tabular-nums">{formatCurrency(totalCents / 100)}</dd>
						</div>
						<div>
							<dt className="text-xs text-muted-foreground">Shared</dt>
							<dd className="font-semibold tabular-nums">{formatCurrency(sharedCents / 100)}</dd>
						</div>
						<div>
							<dt className="text-xs text-muted-foreground">Remaining</dt>
							<dd
								className={`font-semibold tabular-nums ${
									remainingCents === 0 ? "text-green-700" : "text-destructive"
								}`}
								aria-live="polite">
								{formatCurrency(remainingCents / 100)}
							</dd>
						</div>
					</dl>

					<div className="grid grid-cols-2 gap-2 md:flex">
						<Button
							type="button"
							variant="outline"
							onClick={() => save(false)}
							disabled={saving !== null}>
							{saving === "draft" ? "Saving..." : "Save draft"}
						</Button>
						<Button type="submit" disabled={saving !== null || !isBalanced}>
							{saving === "complete" ? "Finalizing..." : "Save & finalize"}
						</Button>
					</div>
				</div>

				{error && (
					<p role="alert" className="mt-2 text-sm text-destructive">
						{error}
					</p>
				)}
			</div>
		</form>
	);
}
