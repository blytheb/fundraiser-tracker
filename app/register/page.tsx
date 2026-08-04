"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");

	async function handleRegister() {
		const result = await authClient.signUp.email({
			name,
			email,
			password,
		});

		console.log(result);
	}
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
		</div>
	);
}
