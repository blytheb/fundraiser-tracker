import React from "react";
import ImageHorizontalCard from "@/components/ImageHorizontalCard";
import IconHorizontalCard from "@/components/IconHorizontalCard";
import TeamActions from "@/components/teams/TeamActions";

import type { Team } from "@/types/team";

export default function page() {
	const varsteam: Team = {
		id: 1,
		name: "Varsity",
		status: "IN_SEASON",
		imageUrl: "https://robohash.org/1?set=set2",
	};
	const jvteam: Team = {
		id: 1,
		name: "JV Girls",
		status: "IN_SEASON",
		imageUrl: "https://robohash.org/2?set=set2",
	};
	return (
		<div className="space-y-2 px-2">
			<ImageHorizontalCard
				image={varsteam.imageUrl}
				heading={varsteam.name}
				subheading={varsteam.status}
				actions={<TeamActions team={varsteam} />}
			/>
			<ImageHorizontalCard
				image={jvteam.imageUrl}
				heading={jvteam.name}
				subheading={jvteam.status}
				actions={<TeamActions team={jvteam} />}
			/>

			<IconHorizontalCard
				icon={"https://robohash.org/1"}
				name="Jane Doe"
				description="Varsity Team"
			/>
			<IconHorizontalCard
				icon={"https://robohash.org/1"}
				name="McDoanlds Fundraiser"
				description="January 12, 2025"
			/>
		</div>
	);
}
