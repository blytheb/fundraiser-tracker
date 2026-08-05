"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function LoginPage() {
	const [error, setError] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");

	async function handleLogin(e: React.FormEvent<HTMLButtonElement>) {
		e.preventDefault();

		setError("");

		const { error } = await authClient.signIn.email({
			email,
			password,
		});

		if (error) {
			setError(error.message);
			return;
		}

		router.replace("/dashboard");
	}
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2 space-y-10">
			<h1>Login Page</h1>

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

			{error && <p>{error}</p>}
			<button onClick={handleLogin}>Login</button>
			<Link href="/register">Go to Register Page</Link>
		</div>
	);
}
