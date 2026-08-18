import React from "react";

type CardProps = {
	fundraiser: Fundraiser;
	activeTeams: Team[];
};

export default function FundraiserTeamCard({
	fundraiser,
	activeTeams,
}: CardProps) {
	return <div>FundraiserTeamCard</div>;
}
