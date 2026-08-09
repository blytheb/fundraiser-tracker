import React from "react";
import NewSeasonDialog from "../../../../components/admin/new-season-dialog";

export default function page() {
	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Seasons</h1>
					<p className="text-muted-foreground">
						Manage your fundraiser seasons.
					</p>
				</div>
				<NewSeasonDialog />
			</div>

			<div className="rounded-lg border">
				<div className="grid grid-cols-4 border-b p-4 text-sm font-medium">
					<span>Seasons</span>
					<span>Year</span>
					<span>Status</span>
					<span>Actions</span>
				</div>
				<div className="p-4 text-sm text-muted-foreground">
					No seasons created yet.
				</div>
			</div>
		</div>
	);
}
