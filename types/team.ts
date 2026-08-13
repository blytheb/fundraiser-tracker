export type Team = {
	id: string;
	name: string;
	season: string;
	playerCount: number;
	status: "Active" | "Inactive";
	imageUrl: string;
};
