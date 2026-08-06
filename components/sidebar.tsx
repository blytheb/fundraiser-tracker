import React from "react";
import Link from "next/link";

export default function Sidebar() {
	return (
		<nav>
			<Link href="/dashboard">Dashboard</Link>
			<Link href="/teams">Teams</Link>
			<Link href="/players">Players</Link>
			<Link href="/fundraisers">Fundraisers</Link>
		</nav>
	);
}
