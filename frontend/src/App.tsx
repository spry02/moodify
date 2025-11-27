import { useEffect, useState } from "react";
import { auth } from "./components/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import MainDashboard from "./components/MainDashboard";
import AuthPopup from "./components/Auth/AuthPopup";
import { User } from "firebase/auth";

export default function App() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);
		});

		return () => unsub();
	}, []);

	if (loading) return <div className="text-white">Loading...</div>;

	return user ? <MainDashboard /> : <AuthPopup />;
}
