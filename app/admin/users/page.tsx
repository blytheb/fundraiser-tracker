import { requireAdmin } from "@/lib/permissions";
import { getAdminUsers } from "@/features/users/data/get-admin-users";
import { Users, UserRound, ShieldCheck } from "lucide-react";
import { getAvailablePlayers } from "@/features/users/data/get-available-players";
import { ManagePlayers } from "@/features/users/manage-players";

export default async function AdminUsersPage() {
	await requireAdmin();

	const users = await getAdminUsers();
	const availablePlayers = await getAvailablePlayers();
	console.log(users);

	return (
		<main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
			<header>
				<p className="text-sm font-semibold uppercase tracking-wider text-primary">
					Menehune Basketball
				</p>
				<h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
					User Management
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					View registered accounts and manage their player access.
				</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-xl border p-5">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-muted">
							<Users className="size-5 text-muted-foreground" />
						</div>
						<p className="text-sm text-muted-foreground">Total Users</p>
					</div>
					<p className="mt-4 text-3xl font-bold tabular-nums">{users.length}</p>
				</div>

				<div className="rounded-xl border p-5">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-muted">
							<UserRound className="size-5 text-muted-foreground" />
						</div>
						<p className="text-sm text-muted-foreground">Parent Accounts</p>
					</div>
					<p className="mt-4 text-3xl font-bold tabular-nums">
						{users.filter((user) => user.hasParentAccess).length}
					</p>
				</div>

				<div className="rounded-xl border p-5">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-muted">
							<ShieldCheck className="size-5 text-muted-foreground" />
						</div>
						<p className="text-sm text-muted-foreground">Admin Accounts</p>
					</div>
					<p className="mt-4 text-3xl font-bold tabular-nums">
						{users.filter((user) => user.role === "ADMIN").length}
					</p>
				</div>
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-lg font-semibold">Registered Users</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Review accounts and their current player access.
					</p>
				</div>

				<div className="overflow-hidden rounded-xl border">
					{users.length === 0 ? (
						<div className="p-8 text-center">
							<p className="font-medium">No registered users</p>
							<p className="mt-2 text-sm text-muted-foreground">
								User accounts will appear here after registration.
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-muted/50 text-left">
									<tr>
										<th className="px-4 py-3 font-medium">User</th>
										<th className="px-4 py-3 font-medium">Role</th>
										<th className="px-4 py-3 font-medium">Player Access</th>
										<th className="px-4 py-3 font-medium">Joined</th>
									</tr>
								</thead>

								<tbody>
									{users.map((user) => (
										<tr key={user.id} className="border-t">
											<td className="px-4 py-4">
												<p className="font-medium">
													{user.name || "Unnamed user"}
												</p>
												<p className="mt-1 text-muted-foreground">
													{user.email}
												</p>
											</td>

											<td className="px-4 py-4">
												<div className="flex flex-wrap gap-2">
													{user.role === "ADMIN" && (
														<span className="rounded-full border px-2.5 py-1 text-xs font-medium">
															Admin
														</span>
													)}
													{user.hasParentAccess && (
														<span className="rounded-full border px-2.5 py-1 text-xs font-medium">
															Parent
														</span>
													)}
													{user.role === "PARENT" && !user.hasParentAccess && (
														<span className="text-xs text-muted-foreground">
															No parent access
														</span>
													)}
												</div>
											</td>

											<td className="px-4 py-4">
												<div className="flex items-center justify-between gap-4">
													<div className="space-y-1">
														{user.playerLinks.length > 0 ? (
															user.playerLinks.map((link) => (
																<p key={link.id} className="font-medium">
																	{link.player.firstName} {link.player.lastName}
																	{!link.player.status && (
																		<span className="ml-2 text-xs text-muted-foreground">
																			(Inactive)
																		</span>
																	)}
																</p>
															))
														) : (
															<span className="text-muted-foreground">
																No players linked
															</span>
														)}
													</div>

													{(user.hasParentAccess || user.role === "PARENT") && (
														<ManagePlayers
															userId={user.id}
															playerLinks={user.playerLinks}
															availablePlayers={availablePlayers}
														/>
													)}
												</div>
											</td>

											<td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
												{user.createdAt.toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</section>
		</main>
	);
}
