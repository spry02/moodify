import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
	createUserWithEmailAndPassword,
	fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterForm() {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handle = async () => {
		setError("");

		try {
			// Sprawdź, czy email już istnieje
			const existing = await fetchSignInMethodsForEmail(auth, email);
			if (existing.length > 0) {
				setError("Email jest już zajęty.");
				return;
			}

			// Rejestracja
			const res = await createUserWithEmailAndPassword(auth, email, password);

			// Zapis profilu
			await setDoc(doc(db, "users", res.user.uid), {
				email,
				username,
			});
		} catch {
			setError("Błąd rejestracji.");
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
				type="text"
				placeholder="Nazwa użytkownika"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
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
				Zarejestruj się
			</button>
		</div>
	);
}
