"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleLogin() {
		const { error } = await authClient.signIn.email({
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
			<h1>Login</h1>
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
			<button onClick={handleLogin}>Login</button>
		</main>
	);
}
