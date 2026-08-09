export default function AdminDashboard() {
	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground">
					Manage your season, players, and fundraisers.
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Active Season</p>
					<p className="mt-2 text-2xl font-bold">2026–2027</p>
				</div>

				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Players</p>
					<p className="mt-2 text-2xl font-bold">0</p>
				</div>

				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Active Fundraisers</p>
					<p className="mt-2 text-2xl font-bold">0</p>
				</div>

				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Fundraiser Revenue</p>
					<p className="mt-2 text-2xl font-bold">$0.00</p>
				</div>
			</div>

			{/* Fundraiser Progress */}
			<div className="mt-8">
				<div className="mb-4">
					<h2 className="text-lg font-semibold">Fundraiser Progress</h2>
					<p className="text-sm text-muted-foreground">
						Track fundraiser goals and current revenue.
					</p>
				</div>

				<div className="rounded-lg border p-6">
					<p className="text-sm text-muted-foreground">No active fundraisers</p>
				</div>
			</div>
		</div>
	);
}
