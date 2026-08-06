"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
	const router = useRouter();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleRegister() {
		const { data, error } = await authClient.signUp.email({
			name,
			email,
			password,
		});

		if (error) {
			console.log(error);
			return;
		}

		router.push("/dashboard");
	}
	return (
		<main>
			<h1>Create Account</h1>

			<input
				placeholder="Name"
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<input
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<input
				placeholder="Password"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button onClick={handleRegister}>Register</button>
		</main>
	);
}
