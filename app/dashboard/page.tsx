"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2 space-y-10">
			<h1>Register Page</h1>

			<input
				type="text"
				placeholder="Username"
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button onClick={handleRegister}>Register</button>
			<button onClick={() => router.push("/login")}>Go to Login Page</button>
		</div>
	);
}
