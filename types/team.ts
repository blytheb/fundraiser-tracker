export type Team = {
	id: string;
	name: string;
	season: string;
    playerCount: number,
    // roster: []
	status: "Active" | "Inactive";
	imageUrl: string;
};
