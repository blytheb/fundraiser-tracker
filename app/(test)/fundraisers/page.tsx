import React from "react";
import AllFundraisersLayout from "@/components/fundraisers/AllFundraisersLayout";
import {
	getAllFundraisers,
	getFundraisersWithTeams,
} from "@/lib/data/fundraisers";

export default async function AllFundraisersPage() {
	const fundraisers = await getFundraisersWithTeams();

	return (
		<div>
			<AllFundraisersLayout initialFundraisers={fundraisers} />
		</div>
	);
}
