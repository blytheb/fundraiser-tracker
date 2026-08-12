export type Player = {
	id: string;
	firstName: string;
	lastName: string;
	status: "Active" | "Inactive";
	imageUrl: string;
};

export type PlayerWithTeams = Player & {
	teams: {
		id: string;
		name: string;
	}[];
};