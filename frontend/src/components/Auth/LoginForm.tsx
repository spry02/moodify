import React, { useState } from "react";
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handle = async () => {
		setError("");

		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch {
			setError("Niepoprawny email lub hasło.");
		}
	};

	return (
		<div className="space-y-4">
			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className="
					w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 
					text-white placeholder-white/40
					hover:bg-white/15 
					focus:outline-none focus:border-white/40 
					transition
				"
			/>

			<input
				type="password"
				placeholder="Hasło"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className="
					w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 
					text-white placeholder-white/40
					hover:bg-white/15 
					focus:outline-none focus:border-white/40 
					transition
				"
			/>

			{error && <p className="text-red-400 text-sm">{error}</p>}

			<button
				onClick={handle}
				className="
					w-full px-4 py-2 rounded-lg bg-white/20 
					border border-white/30
					hover:bg-white/30 hover:border-white/40
					transition text-white
				"
			>
				Zaloguj się
			</button>
		</div>
	);
}
