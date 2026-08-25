export type Fund = {
	id: string;
	type: "SALES" | "EVENT_PROFIT" | "TIPS" | "OTHER";
	amount: number;
	description: string;
};
