"use client";

import React from "react";

export default function page() {
	return <div>page</div>;
}

// import Link from "next/link";
// import {
// 	ArrowLeft,
// 	CalendarDays,
// 	ChevronRight,
// 	Plus,
// 	Users,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import SummarySection from "@/components/teams/SummarySection";
// // -----------------------------
// // Types
// // -----------------------------

// type Player = {
// 	id: string;
// 	firstName: string;
// 	lastName: string;
// 	jerseyNumber?: number | null;
// 	position?: string | null;
// 	status: boolean;
// };

// type Fundraiser = {
// 	id: string;
// 	name: string;
// 	status: "ACTIVE" | "COMPLETED";
// 	totalRaised: number;
// 	participants: number;
// };

// type Trip = {
// 	id: string;
// 	name: string;
// 	startDate: string;
// 	endDate: string;
// 	estimatedCost: number;
// };

// type Team = {
// 	id: string;
// 	name: string;
// 	season: string;
// 	level: string;
// 	players: Player[];
// 	fundraisers: Fundraiser[];
// 	trips: Trip[];
// };

// // -----------------------------
// // Mock Data
// // -----------------------------

// const mockTeam: Team = {
// 	id: "team-18u",
// 	name: "Mililani 18U",
// 	season: "2026 Season",
// 	level: "Varsity",

// 	players: [
// 		{
// 			id: "player-1",
// 			firstName: "Emma",
// 			lastName: "Johnson",
// 			jerseyNumber: 4,
// 			position: "Setter",
// 			status: true,
// 		},
// 		{
// 			id: "player-2",
// 			firstName: "Sophia",
// 			lastName: "Lee",
// 			jerseyNumber: 12,
// 			position: "Outside",
// 			status: true,
// 		},
// 		{
// 			id: "player-3",
// 			firstName: "Mia",
// 			lastName: "Garcia",
// 			jerseyNumber: 8,
// 			position: "Libero",
// 			status: true,
// 		},
// 		{
// 			id: "player-4",
// 			firstName: "Ava",
// 			lastName: "Smith",
// 			jerseyNumber: 15,
// 			position: "Middle",
// 			status: true,
// 		},
// 		{
// 			id: "player-5",
// 			firstName: "Olivia",
// 			lastName: "Brown",
// 			jerseyNumber: 7,
// 			position: "Outside",
// 			status: true,
// 		},
// 		{
// 			id: "player-6",
// 			firstName: "Isabella",
// 			lastName: "Davis",
// 			jerseyNumber: 10,
// 			position: "Setter",
// 			status: true,
// 		},
// 		{
// 			id: "player-7",
// 			firstName: "Amelia",
// 			lastName: "Wilson",
// 			jerseyNumber: 3,
// 			position: "Middle",
// 			status: true,
// 		},
// 		{
// 			id: "player-8",
// 			firstName: "Charlotte",
// 			lastName: "Martinez",
// 			jerseyNumber: 6,
// 			position: "Opposite",
// 			status: true,
// 		},
// 		{
// 			id: "player-9",
// 			firstName: "Harper",
// 			lastName: "Anderson",
// 			jerseyNumber: 9,
// 			position: "Outside",
// 			status: true,
// 		},
// 		{
// 			id: "player-10",
// 			firstName: "Evelyn",
// 			lastName: "Taylor",
// 			jerseyNumber: 2,
// 			position: "Libero",
// 			status: true,
// 		},
// 		{
// 			id: "player-11",
// 			firstName: "Abigail",
// 			lastName: "Thomas",
// 			jerseyNumber: 11,
// 			position: "Middle",
// 			status: true,
// 		},
// 		{
// 			id: "player-12",
// 			firstName: "Ella",
// 			lastName: "Moore",
// 			jerseyNumber: 5,
// 			position: "Outside",
// 			status: true,
// 		},
// 		{
// 			id: "player-13",
// 			firstName: "Grace",
// 			lastName: "Jackson",
// 			jerseyNumber: 14,
// 			position: "Opposite",
// 			status: true,
// 		},
// 		{
// 			id: "player-14",
// 			firstName: "Chloe",
// 			lastName: "Martin",
// 			jerseyNumber: 1,
// 			position: "Setter",
// 			status: true,
// 		},
// 	],

// 	fundraisers: [
// 		{
// 			id: "fundraiser-1",
// 			name: "Fall Tournament Fundraiser",
// 			status: "COMPLETED",
// 			totalRaised: 2450,
// 			participants: 14,
// 		},
// 		{
// 			id: "fundraiser-2",
// 			name: "Restaurant Night",
// 			status: "ACTIVE",
// 			totalRaised: 1200,
// 			participants: 14,
// 		},
// 		{
// 			id: "fundraiser-3",
// 			name: "Holiday Gift Card Fundraiser",
// 			status: "ACTIVE",
// 			totalRaised: 875,
// 			participants: 12,
// 		},
// 	],

// 	trips: [
// 		{
// 			id: "trip-1",
// 			name: "Oregon Tournament",
// 			startDate: "Jan 16, 2027",
// 			endDate: "Jan 19, 2027",
// 			estimatedCost: 4800,
// 		},
// 		{
// 			id: "trip-2",
// 			name: "Florida Nationals",
// 			startDate: "Jun 20, 2027",
// 			endDate: "Jun 25, 2027",
// 			estimatedCost: 7200,
// 		},
// 	],
// };

// // -----------------------------
// // Page
// // -----------------------------

// export default function TeamPage() {
// 	const team = mockTeam;

// 	const activeFundraisers = team.fundraisers.filter(
// 		(fundraiser) => fundraiser.status === "ACTIVE",
// 	).length;

// 	return (
// 		<main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
// 			{/* Back */}
// 			{/* <div className="mb-4">
// 				<Button variant="ghost" size="sm" asChild className="-ml-2">
// 					<Link href="/teams">
// 						<ArrowLeft className="mr-2 h-4 w-4" />
// 						Teams
// 					</Link>
// 				</Button>
// 			</div> */}

// 			{/* Team Header */}
// 			{/* <Card className="mb-4">
// 				<CardContent className="p-5">
// 					<div className="flex items-start justify-between gap-4">
// 						<div className="min-w-0">
// 							<p className="text-2xl font-bold tracking-tight">{team.name}</p>

// 							<div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
// 								<span>{team.season}</span>

// 								<span>•</span>

// 								<span>{team.level}</span>
// 							</div>
// 						</div>

// 						<Badge variant="secondary">{team.players.length} Players</Badge>
// 					</div>
// 				</CardContent>
// 			</Card> */}

// 			{/* Summary */}
// 			{/* <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
// 				<Card>
// 					<CardContent className="p-4">
// 						<div className="flex items-center gap-2 text-muted-foreground">
// 							<Users className="h-4 w-4" />

// 							<span className="text-xs font-medium sm:text-sm">Players</span>
// 						</div>

// 						<p className="mt-2 text-2xl font-bold">{team.players.length}</p>
// 					</CardContent>
// 				</Card>

// 				<Card>
// 					<CardContent className="p-4">
// 						<p className="text-xs font-medium text-muted-foreground sm:text-sm">
// 							Fundraisers
// 						</p>

// 						<p className="mt-2 text-2xl font-bold">{activeFundraisers}</p>

// 						<p className="text-xs text-muted-foreground">Active</p>
// 					</CardContent>
// 				</Card>

// 				<Card>
// 					<CardContent className="p-4">
// 						<div className="flex items-center gap-2 text-muted-foreground">
// 							<CalendarDays className="h-4 w-4" />

// 							<span className="text-xs font-medium sm:text-sm">Trips</span>
// 						</div>

// 						<p className="mt-2 text-2xl font-bold">{upcomingTrips}</p>

// 						<p className="text-xs text-muted-foreground">Upcoming</p>
// 					</CardContent>
// 				</Card>
// 			</div> */}

// 			{/* Tabs */}
// 			<Tabs defaultValue="roster" className="flex flex-col w-full">
// 				<TabsList className="flex w-full flex-row">
// 					<TabsTrigger value="roster">{`Roster (${team.players.length})`}</TabsTrigger>

// 					<TabsTrigger value="fundraisers">{`Fundraisers (${team.fundraisers.length})`}</TabsTrigger>

// 					<TabsTrigger value="trips">{`Trips (${team.trips.length})`}</TabsTrigger>
// 				</TabsList>

// 				{/* ---------------- ROSTER ---------------- */}
// 				<TabsContent value="roster" className="mt-4">
// 					<div className="mb-3 flex items-center justify-between">
// 						<div>
// 							<h2 className="font-semibold">Roster</h2>

// 							<p className="text-sm text-muted-foreground">
// 								{team.players.length} players
// 							</p>
// 						</div>

// 						<Button size="sm">
// 							<Plus className="mr-1.5 h-4 w-4" />
// 							Add Player
// 						</Button>
// 					</div>

// 					<Card>
// 						<CardContent className="p-0">
// 							<div className="divide-y">
// 								{team.players.map((player) => (
// 									<Link
// 										key={player.id}
// 										href={`/players/${player.id}`}
// 										className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50">
// 										<div className="flex min-w-0 items-center gap-3">
// 											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
// 												{player.firstName[0]}
// 												{player.lastName[0]}
// 											</div>

// 											<div className="min-w-0">
// 												<p className="truncate text-sm font-medium">
// 													{player.firstName} {player.lastName}
// 												</p>

// 												<p className="text-xs text-muted-foreground">
// 													{player.jerseyNumber
// 														? `#${player.jerseyNumber}`
// 														: "No number"}

// 													{player.position && ` • ${player.position}`}
// 												</p>
// 											</div>
// 										</div>

// 										<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
// 									</Link>
// 								))}
// 							</div>
// 						</CardContent>
// 					</Card>
// 				</TabsContent>

// 				{/* ---------------- FUNDRAISERS ---------------- */}
// 				<TabsContent value="fundraisers" className="mt-4">
// 					<div className="mb-3 flex items-center justify-between">
// 						<div>
// 							<h2 className="font-semibold">Fundraisers</h2>

// 							<p className="text-sm text-muted-foreground">
// 								{team.fundraisers.length} fundraisers
// 							</p>
// 						</div>

// 						<Button size="sm">
// 							<Plus className="mr-1.5 h-4 w-4" />
// 							Add
// 						</Button>
// 					</div>

// 					<div className="space-y-3">
// 						{team.fundraisers.map((fundraiser) => (
// 							<Link
// 								key={fundraiser.id}
// 								href={`/fundraisers/${fundraiser.id}`}
// 								className="block">
// 								<Card className="transition-colors hover:bg-muted/50">
// 									<CardContent className="p-4">
// 										<div className="flex items-start justify-between gap-4">
// 											<div className="min-w-0">
// 												<p className="font-medium">{fundraiser.name}</p>

// 												<div className="mt-1 flex items-center gap-2">
// 													<Badge
// 														variant={
// 															fundraiser.status === "ACTIVE"
// 																? "default"
// 																: "secondary"
// 														}>
// 														{fundraiser.status}
// 													</Badge>

// 													<span className="text-xs text-muted-foreground">
// 														{fundraiser.participants} participants
// 													</span>
// 												</div>
// 											</div>

// 											<ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
// 										</div>

// 										<div className="mt-4">
// 											<p className="text-xs uppercase tracking-wide text-muted-foreground">
// 												Total Raised
// 											</p>

// 											<p className="mt-1 text-xl font-bold">
// 												$
// 												{fundraiser.totalRaised.toLocaleString("en-US", {
// 													minimumFractionDigits: 2,
// 													maximumFractionDigits: 2,
// 												})}
// 											</p>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</Link>
// 						))}
// 					</div>
// 				</TabsContent>

// 				{/* ---------------- TRIPS ---------------- */}
// 				<TabsContent value="trips" className="mt-4">
// 					<div className="mb-3 flex items-center justify-between">
// 						<div>
// 							<h2 className="font-semibold">Trips</h2>

// 							<p className="text-sm text-muted-foreground">
// 								{team.trips.length} upcoming trips
// 							</p>
// 						</div>

// 						<Button size="sm">
// 							<Plus className="mr-1.5 h-4 w-4" />
// 							Add
// 						</Button>
// 					</div>

// 					<div className="space-y-3">
// 						{team.trips.map((trip) => (
// 							<Link key={trip.id} href={`/trips/${trip.id}`} className="block">
// 								<Card className="transition-colors hover:bg-muted/50">
// 									<CardContent className="p-4">
// 										<div className="flex items-start justify-between gap-4">
// 											<div>
// 												<p className="font-medium">{trip.name}</p>

// 												<p className="mt-1 text-sm text-muted-foreground">
// 													{trip.startDate} – {trip.endDate}
// 												</p>
// 											</div>

// 											<ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
// 										</div>

// 										<div className="mt-4">
// 											<p className="text-xs uppercase tracking-wide text-muted-foreground">
// 												Estimated Cost
// 											</p>

// 											<p className="mt-1 text-xl font-bold">
// 												$
// 												{trip.estimatedCost.toLocaleString("en-US", {
// 													minimumFractionDigits: 2,
// 													maximumFractionDigits: 2,
// 												})}
// 											</p>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</Link>
// 						))}
// 					</div>
// 				</TabsContent>
// 			</Tabs>
// 		</main>
// 	);
// }
